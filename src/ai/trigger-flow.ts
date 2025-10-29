
import { config } from 'dotenv';
config();

import { sendDailySetups } from './flows/send-daily-setups';

console.log('Attempting to trigger the sendDailySetups flow...');

sendDailySetups({})
  .then((result) => {
    console.log('Flow completed successfully.');
    console.log(`Sent: ${result.sentCount}, Skipped: ${result.skippedCount}, Total Users: ${result.totalUsers}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred while triggering the flow:', error);
    process.exit(1);
  });
