import { Request, Response } from 'express';
import RiskZone from '../models/RiskZone';
import Disease from '../models/Disease';
import MosquitoData from '../models/MosquitoData';
import HealthcareData from '../models/HealthcareData';
import WeatherData from '../models/WeatherData';

export const getRiskZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const { disease_id, risk_level, area_name } = req.query;
    const filter: any = {};

    if (disease_id) filter.disease_id = disease_id;
    if (risk_level) filter.risk_level = risk_level;
    if (area_name) filter.area_name = area_name;

    const riskZones = await RiskZone.find(filter)
      .sort({ risk_level: -1, last_updated: -1 })
      .populate('disease_id');

    res.status(200).json({
      success: true,
      count: riskZones.length,
      data: riskZones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching risk zones',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRiskMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { disease_id } = req.query;
    const filter: any = {};

    if (disease_id) filter.disease_id = disease_id;

    const riskZones = await RiskZone.find(filter);

    const mapData = riskZones.map(zone => ({
      area_name: zone.area_name,
      coordinates: zone.location.coordinates,
      risk_level: zone.risk_level,
      disease_id: zone.disease_id,
      last_updated: zone.last_updated
    }));

    const summary = {
      total_zones: riskZones.length,
      high_risk: riskZones.filter(z => z.risk_level === 'high').length,
      medium_risk: riskZones.filter(z => z.risk_level === 'medium').length,
      low_risk: riskZones.filter(z => z.risk_level === 'low').length
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        zones: mapData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating risk map',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, start_date, end_date, area_name } = req.query;

    if (!type || !['mosquito', 'healthcare', 'weather'].includes(type as string)) {
      res.status(400).json({
        success: false,
        message: 'Type must be one of: mosquito, healthcare, weather'
      });
      return;
    }

    const dateFilter: any = {};
    if (start_date) dateFilter.$gte = new Date(start_date as string);
    if (end_date) dateFilter.$lte = new Date(end_date as string);

    let trends: any[] = [];

    if (type === 'mosquito') {
      const matchStage: any = {};
      if (Object.keys(dateFilter).length > 0) matchStage.timestamp = dateFilter;

      trends = await MosquitoData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              type: '$mosquito_type'
            },
            total_count: { $sum: '$count' },
            avg_count: { $avg: '$count' },
            readings: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);
    } else if (type === 'healthcare') {
      const matchStage: any = {};
      if (Object.keys(dateFilter).length > 0) matchStage.timestamp = dateFilter;
      if (area_name) matchStage.area_name = area_name;

      trends = await HealthcareData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            total_patients: { $sum: '$current_patients' },
            total_capacity: { $sum: '$total_capacity' },
            total_available_beds: { $sum: '$available_beds' },
            facilities_count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            utilization_rate: {
              $multiply: [
                { $divide: ['$total_patients', '$total_capacity'] },
                100
              ]
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } else if (type === 'weather') {
      const matchStage: any = {};
      if (Object.keys(dateFilter).length > 0) matchStage.timestamp = dateFilter;
      if (area_name) matchStage.area_name = area_name;

      trends = await WeatherData.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            avg_temperature: { $avg: '$temperature' },
            avg_humidity: { $avg: '$humidity' },
            total_rainfall: { $sum: '$rainfall' },
            readings: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }

    res.status(200).json({
      success: true,
      type,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDiseases = async (req: Request, res: Response): Promise<void> => {
  try {
    const diseases = await Disease.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: diseases.length,
      data: diseases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching diseases',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDiseaseRisk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const disease = await Disease.findOne({ disease_id: id });
    if (!disease) {
      res.status(404).json({
        success: false,
        message: 'Disease not found'
      });
      return;
    }

    const riskZones = await RiskZone.find({ disease_id: id });

    const riskSummary = {
      disease: disease.name,
      total_zones: riskZones.length,
      high_risk_zones: riskZones.filter(z => z.risk_level === 'high').length,
      medium_risk_zones: riskZones.filter(z => z.risk_level === 'medium').length,
      low_risk_zones: riskZones.filter(z => z.risk_level === 'low').length,
      most_affected_areas: riskZones
        .filter(z => z.risk_level === 'high')
        .map(z => z.area_name)
    };

    res.status(200).json({
      success: true,
      data: riskSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating disease risk',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDiseaseHotspots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { min_risk_level = 'medium' } = req.query;

    const disease = await Disease.findOne({ disease_id: id });
    if (!disease) {
      res.status(404).json({
        success: false,
        message: 'Disease not found'
      });
      return;
    }

    const riskLevels = ['low', 'medium', 'high'];
    const minIndex = riskLevels.indexOf(min_risk_level as string);
    const acceptedLevels = riskLevels.slice(minIndex);

    const hotspots = await RiskZone.find({
      disease_id: id,
      risk_level: { $in: acceptedLevels }
    }).sort({ risk_level: -1 });

    res.status(200).json({
      success: true,
      disease: disease.name,
      count: hotspots.length,
      data: hotspots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error identifying hotspots',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOvercrowdedFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threshold = 90 } = req.query;

    const pipeline = [
      { $sort: { facility_id: 1 as const, timestamp: -1 as const } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest_data' } },
      {
        $addFields: {
          utilization: {
            $multiply: [
              { $divide: ['$current_patients', '$total_capacity'] },
              100
            ]
          }
        }
      },
      {
        $match: {
          utilization: { $gte: parseInt(threshold as string) }
        }
      },
      { $sort: { utilization: -1 as const } }
    ] as any;

    const overcrowded = await HealthcareData.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: overcrowded.length,
      threshold: `${threshold}%`,
      data: overcrowded
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding overcrowded facilities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUnderutilizedFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { threshold = 50 } = req.query;

    const pipeline = [
      { $sort: { facility_id: 1 as const, timestamp: -1 as const } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest_data' } },
      {
        $addFields: {
          utilization: {
            $multiply: [
              { $divide: ['$current_patients', '$total_capacity'] },
              100
            ]
          }
        }
      },
      {
        $match: {
          utilization: { $lte: parseInt(threshold as string) }
        }
      },
      { $sort: { utilization: 1 as const } }
    ] as any;

    const underutilized = await HealthcareData.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: underutilized.length,
      threshold: `${threshold}%`,
      data: underutilized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding underutilized facilities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const overcrowdedPipeline = [
      { $sort: { facility_id: 1 as const, timestamp: -1 as const } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest_data' } },
      {
        $addFields: {
          utilization: {
            $multiply: [
              { $divide: ['$current_patients', '$total_capacity'] },
              100
            ]
          }
        }
      },
      { $match: { utilization: { $gte: 90 } } }
    ];

    const underutilizedPipeline = [
      { $sort: { facility_id: 1 as const, timestamp: -1 as const } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest_data' } },
      {
        $addFields: {
          utilization: {
            $multiply: [
              { $divide: ['$current_patients', '$total_capacity'] },
              100
            ]
          }
        }
      },
      { $match: { utilization: { $lte: 50 } } }
    ];

    const [overcrowded, underutilized] = await Promise.all([
      HealthcareData.aggregate(overcrowdedPipeline),
      HealthcareData.aggregate(underutilizedPipeline)
    ]);

    const recommendations = [];

    for (const facility of overcrowded) {
      const nearby = underutilized.filter(
        u => u.area_name === facility.area_name && u.available_beds > 0
      );

      if (nearby.length > 0) {
        recommendations.push({
          type: 'patient_transfer',
          from: facility.facility_name,
          from_utilization: facility.utilization.toFixed(2),
          suggestions: nearby.map((n: any) => ({
            to: n.facility_name,
            available_beds: n.available_beds,
            utilization: n.utilization.toFixed(2)
          }))
        });
      } else {
        recommendations.push({
          type: 'urgent_attention',
          facility: facility.facility_name,
          area: facility.area_name,
          utilization: facility.utilization.toFixed(2),
          message: 'No nearby facilities with capacity available'
        });
      }
    }

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
