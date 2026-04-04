import { Request, Response } from 'express';
import HealthcareFacility from '../models/HealthcareFacility';
import HealthcareData from '../models/HealthcareData';

export const registerFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facility_id, name, type, location, contact, total_capacity, services } = req.body;

    if (!facility_id || !name || !type || !location || total_capacity === undefined) {
      res.status(400).json({
        success: false,
        message: 'facility_id, name, type, location, and total_capacity are required'
      });
      return;
    }

    const existingFacility = await HealthcareFacility.findOne({ facility_id });
    if (existingFacility) {
      res.status(400).json({
        success: false,
        message: 'Facility with this ID already exists'
      });
      return;
    }

    const facility = await HealthcareFacility.create({
      facility_id,
      name,
      type,
      location,
      contact,
      total_capacity,
      services: services || []
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare facility registered successfully',
      data: facility
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering facility',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const filter: any = {};

    if (type) filter.type = type;

    const facilities = await HealthcareFacility.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching facilities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getFacilityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const facility = await HealthcareFacility.findOne({ facility_id: req.params.id });

    if (!facility) {
      res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: facility
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching facility',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const ingestHealthcareData = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    const validatedData = [];
    for (const item of data) {
      const { 
        facility_id, 
        facility_name, 
        location, 
        area_name, 
        current_patients, 
        total_capacity, 
        available_beds,
        disease_breakdown,
        timestamp 
      } = item;

      if (!facility_id || !facility_name || !location || !area_name || 
          current_patients === undefined || total_capacity === undefined || 
          available_beds === undefined) {
        res.status(400).json({
          success: false,
          message: 'facility_id, facility_name, location, area_name, current_patients, total_capacity, and available_beds are required for each entry'
        });
        return;
      }

      validatedData.push({
        facility_id,
        facility_name,
        location,
        area_name,
        current_patients,
        total_capacity,
        available_beds,
        disease_breakdown: disease_breakdown || [],
        timestamp: timestamp || new Date(),
        submitted_at: new Date()
      });
    }

    const insertedData = await HealthcareData.insertMany(validatedData);

    res.status(201).json({
      success: true,
      message: `${insertedData.length} healthcare data record(s) ingested successfully`,
      data: {
        count: insertedData.length,
        records: insertedData
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error ingesting healthcare data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getHealthcareData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facility_id, area_name, start_date, end_date, limit = 100 } = req.query;
    const filter: any = {};

    if (facility_id) filter.facility_id = facility_id;
    if (area_name) filter.area_name = area_name;
    
    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) filter.timestamp.$gte = new Date(start_date as string);
      if (end_date) filter.timestamp.$lte = new Date(end_date as string);
    }

    const data = await HealthcareData.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string));

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching healthcare data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCurrentCapacity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { area_name } = req.query;

    const pipeline: any[] = [
      { $sort: { facility_id: 1, timestamp: -1 } },
      {
        $group: {
          _id: '$facility_id',
          latest_data: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latest_data' } }
    ];

    if (area_name) {
      pipeline.unshift({ $match: { area_name } });
    }

    const latestData = await HealthcareData.aggregate(pipeline);

    const summary = {
      total_facilities: latestData.length,
      total_capacity: latestData.reduce((sum, d) => sum + d.total_capacity, 0),
      total_patients: latestData.reduce((sum, d) => sum + d.current_patients, 0),
      total_available_beds: latestData.reduce((sum, d) => sum + d.available_beds, 0),
      overcrowded: latestData.filter(d => d.current_patients >= d.total_capacity * 0.9).length,
      utilization_rate: 0
    };

    if (summary.total_capacity > 0) {
      summary.utilization_rate = (summary.total_patients / summary.total_capacity) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        facilities: latestData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching current capacity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
