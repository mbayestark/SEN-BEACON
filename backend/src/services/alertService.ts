import HealthcareData from '../models/HealthcareData';

export const checkHealthcareAlerts = async (): Promise<void> => {
  try {
    console.log(' Checking healthcare facility alerts...');

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
          utilization: { $gte: 90 }
        }
      }
    ];

    const overcrowded = await HealthcareData.aggregate(pipeline);

    if (overcrowded.length > 0) {
      console.log(`  ALERT: ${overcrowded.length} facilities are overcrowded (>90% capacity)`);
      for (const facility of overcrowded) {
        console.log(`   - ${facility.facility_name}: ${facility.utilization.toFixed(1)}% utilization`);
      }
    } else {
      console.log('All facilities operating within normal capacity');
    }

    console.log('Healthcare alert check completed');
  } catch (error) {
    console.error('Error checking healthcare alerts:', error);
  }
};
