import MosquitoData from '../models/MosquitoData';
import HealthcareData from '../models/HealthcareData';

export const aggregateData = async (): Promise<void> => {
  try {
    console.log('Starting data aggregation...');

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const mosquitoStats = await MosquitoData.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: {
            device_id: '$device_id',
            type: '$mosquito_type'
          },
          count: { $sum: 1 },
          avg_count: { $avg: '$count' },
          total_mosquitoes: { $sum: '$count' }
        }
      }
    ]);

    const healthcareStats = await HealthcareData.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      {
        $group: {
          _id: '$facility_id',
          submissions: { $sum: 1 },
          avg_patients: { $avg: '$current_patients' },
          avg_utilization: {
            $avg: {
              $multiply: [
                { $divide: ['$current_patients', '$total_capacity'] },
                100
              ]
            }
          }
        }
      }
    ]);

    console.log(`Aggregated ${mosquitoStats.length} mosquito device stats`);
    console.log(`Aggregated ${healthcareStats.length} healthcare facility stats`);
    console.log('Data aggregation completed');
  } catch (error) {
    console.error('Error aggregating data:', error);
  }
};
