import { Request, Response } from 'express';
import RiskZone from '../models/RiskZone';
import HealthcareFacility from '../models/HealthcareFacility';
import HealthcareData from '../models/HealthcareData';
import { findNearestLocations } from '../utils/geoUtils';

export const checkRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, long, area } = req.query;

    if (!lat && !long && !area) {
      res.status(400).json({
        success: false,
        message: 'Either coordinates (lat, long) or area name is required'
      });
      return;
    }

    let riskZones: any[] = [];

    if (area) {
      riskZones = await RiskZone.find({ area_name: area }).populate('disease_id');
    } else if (lat && long) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(long as string);

      riskZones = await RiskZone.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 10000
          }
        }
      }).limit(5).populate('disease_id');
    }

    if (riskZones.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No risk data available for this location',
        data: {
          risk_level: 'unknown',
          risks: [],
          nearby_facilities: [],
          safety_tips: ['Stay informed about local health advisories']
        }
      });
      return;
    }

    const highestRisk = riskZones.reduce((max, zone) => {
      const riskLevels = { low: 1, medium: 2, high: 3 };
      return riskLevels[zone.risk_level as keyof typeof riskLevels] > 
             riskLevels[max.risk_level as keyof typeof riskLevels] ? zone : max;
    }, riskZones[0]);

    const nearbyFacilities = await HealthcareFacility.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: lat && long 
              ? [parseFloat(long as string), parseFloat(lat as string)]
              : highestRisk.location.coordinates
          },
          $maxDistance: 20000
        }
      }
    }).limit(3);

    const safetyTips = generateSafetyTips(highestRisk.risk_level);

    res.status(200).json({
      success: true,
      data: {
        risk_level: highestRisk.risk_level,
        area: highestRisk.area_name,
        risks: riskZones.map(zone => ({
          disease: zone.disease_id?.name || zone.disease_id,
          risk_level: zone.risk_level,
          area: zone.area_name
        })),
        nearby_facilities: nearbyFacilities.map(f => ({
          name: f.name,
          type: f.type,
          contact: f.contact,
          coordinates: f.location.coordinates
        })),
        safety_tips: safetyTips
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking risk level',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const findNearestFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, long, disease, limit = 5 } = req.query;

    if (!lat || !long) {
      res.status(400).json({
        success: false,
        message: 'Coordinates (lat, long) are required'
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(long as string);

    const facilities = await HealthcareFacility.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 50000
        }
      }
    }).limit(parseInt(limit as string));

    const facilityIds = facilities.map(f => f.facility_id);

    const latestCapacityData = await HealthcareData.aggregate([
      { $match: { facility_id: { $in: facilityIds } } },
      { $sort: { facility_id: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      }
    ]);

    const capacityMap = new Map(
      latestCapacityData.map(item => [item._id, item.latest_data])
    );

    const results = facilities.map(facility => {
      const capacityData = capacityMap.get(facility.facility_id);
      
      return {
        facility_id: facility.facility_id,
        name: facility.name,
        type: facility.type,
        contact: facility.contact,
        coordinates: facility.location.coordinates,
        total_capacity: facility.total_capacity,
        current_patients: capacityData?.current_patients || 0,
        available_beds: capacityData?.available_beds || facility.total_capacity,
        last_updated: capacityData?.timestamp,
        services: facility.services
      };
    });

    const withAvailability = disease 
      ? results.filter(r => r.available_beds > 0)
      : results;

    res.status(200).json({
      success: true,
      count: withAvailability.length,
      data: withAvailability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearest facilities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const generateSafetyTips = (riskLevel: string): string[] => {
  const baseTips = [
    'Monitor local health advisories regularly',
    'Maintain good hygiene practices',
    'Seek medical attention if you experience symptoms'
  ];

  const riskSpecificTips: Record<string, string[]> = {
    high: [
      'Avoid outdoor activities during peak mosquito hours (dawn and dusk)',
      'Use mosquito repellent and wear protective clothing',
      'Ensure all windows and doors have screens',
      'Eliminate standing water around your home',
      'Consider staying indoors if possible'
    ],
    medium: [
      'Use mosquito nets while sleeping',
      'Apply mosquito repellent when going outdoors',
      'Remove standing water from containers',
      'Keep your surroundings clean'
    ],
    low: [
      'Continue preventive measures',
      'Stay informed about changes in risk levels',
      'Report any mosquito breeding sites to authorities'
    ]
  };

  const specificTips = riskSpecificTips[riskLevel] || riskSpecificTips.low || [];
  return [...baseTips, ...specificTips];
};
