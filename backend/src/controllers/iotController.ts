import { Request, Response } from 'express';
import IoTDevice from '../models/IoTDevice';
import MosquitoData from '../models/MosquitoData';

export const registerDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { device_id, location, area_name } = req.body;

    if (!device_id || !location || !area_name) {
      res.status(400).json({
        success: false,
        message: 'device_id, location, and area_name are required'
      });
      return;
    }

    const existingDevice = await IoTDevice.findOne({ device_id });
    if (existingDevice) {
      res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
      return;
    }

    const device = await IoTDevice.create({
      device_id,
      location,
      area_name,
      status: 'active',
      last_ping: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering device',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, area_name } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (area_name) filter.area_name = area_name;

    const devices = await IoTDevice.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching devices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDeviceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const device = await IoTDevice.findOne({ device_id: req.params.id });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, location, area_name } = req.body;
    const updateData: any = {};

    if (status) updateData.status = status;
    if (location) updateData.location = location;
    if (area_name) updateData.area_name = area_name;
    updateData.last_ping = new Date();

    const device = await IoTDevice.findOneAndUpdate(
      { device_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating device',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const ingestMosquitoData = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = Array.isArray(req.body) ? req.body : [req.body];

    const validatedData = [];
    for (const item of data) {
      const { device_id, location, mosquito_breakdown, timestamp, metadata } = item;

      if (!device_id || !location || !mosquito_breakdown || !Array.isArray(mosquito_breakdown) || mosquito_breakdown.length === 0) {
        res.status(400).json({
          success: false,
          message: 'device_id, location, and mosquito_breakdown array are required for each entry'
        });
        return;
      }

      const total_count = mosquito_breakdown.reduce((sum: number, m: any) => sum + (m.count || 0), 0);

      validatedData.push({
        device_id,
        location,
        mosquito_breakdown,
        total_count,
        timestamp: timestamp || new Date(),
        metadata
      });
    }

    const insertedData = await MosquitoData.insertMany(validatedData);

    await IoTDevice.findOneAndUpdate(
      { device_id: validatedData[0]!.device_id },
      { last_ping: new Date() }
    );

    res.status(201).json({
      success: true,
      message: `${insertedData.length} mosquito data record(s) ingested successfully`,
      data: {
        count: insertedData.length,
        records: insertedData
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error ingesting mosquito data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMosquitoData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { device_id, mosquito_type, start_date, end_date, area_name, limit = 100 } = req.query;
    const filter: any = {};

    if (device_id) filter.device_id = device_id;
    if (mosquito_type) filter['mosquito_breakdown.mosquito_type'] = mosquito_type;
    
    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) filter.timestamp.$gte = new Date(start_date as string);
      if (end_date) filter.timestamp.$lte = new Date(end_date as string);
    }

    const data = await MosquitoData.find(filter)
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
      message: 'Error fetching mosquito data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMosquitoStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { device_id, mosquito_type, start_date, end_date } = req.query;
    const matchStage: any = {};

    if (device_id) matchStage.device_id = device_id;
    
    if (start_date || end_date) {
      matchStage.timestamp = {};
      if (start_date) matchStage.timestamp.$gte = new Date(start_date as string);
      if (end_date) matchStage.timestamp.$lte = new Date(end_date as string);
    }

    const stats = await MosquitoData.aggregate([
      { $match: matchStage },
      { $unwind: '$mosquito_breakdown' },
      ...(mosquito_type ? [{ $match: { 'mosquito_breakdown.mosquito_type': mosquito_type } }] : []),
      {
        $group: {
          _id: '$mosquito_breakdown.mosquito_type',
          total_count: { $sum: '$mosquito_breakdown.count' },
          avg_count: { $avg: '$mosquito_breakdown.count' },
          max_count: { $max: '$mosquito_breakdown.count' },
          min_count: { $min: '$mosquito_breakdown.count' },
          readings: { $sum: 1 }
        }
      },
      { $sort: { total_count: -1 } }
    ]);

    const overallStats = await MosquitoData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total_readings: { $sum: 1 },
          total_mosquitoes: { $sum: '$total_count' },
          avg_per_reading: { $avg: '$total_count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        by_type: stats,
        overall: overallStats[0] || {
          total_readings: 0,
          total_mosquitoes: 0,
          avg_per_reading: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating mosquito stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
