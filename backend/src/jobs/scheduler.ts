import cron from 'node-cron';
import { calculateRiskZones } from '../services/riskCalculationService';
import { aggregateData } from '../services/aggregationService';
import { checkHealthcareAlerts } from '../services/alertService';
import { isDevelopment } from '../config/environement';

export const startScheduledJobs = (): void => {
  console.log('Starting scheduled background jobs...');

  cron.schedule('*/30 * * * *', async () => {
    console.log('\n [CRON] Running risk zone calculation (every 30 minutes)');
    await calculateRiskZones();
  });

  cron.schedule('*/15 * * * *', async () => {
    console.log('\n [CRON] Running healthcare alert check (every 15 minutes)');
    await checkHealthcareAlerts();
  });

  cron.schedule('0 * * * *', async () => {
    console.log('\n [CRON] Running data aggregation (every hour)');
    await aggregateData();
  });

  if (isDevelopment) {
    console.log('Development mode: Running initial tasks...');
    setTimeout(async () => {
      await calculateRiskZones();
      await checkHealthcareAlerts();
      await aggregateData();
    }, 5000);
  }

  console.log('Scheduled jobs started successfully');
  console.log('   - Risk zone calculation: Every 30 minutes');
  console.log('   - Healthcare alerts: Every 15 minutes');
  console.log('   - Data aggregation: Every hour');
};
