
import { config } from 'dotenv';
config();

import { sendTrialReminderEmail } from '@/lib/mailgun';

console.log('Attempting to send a test trial reminder email...');

sendTrialReminderEmail({ to: 'admin@profitscout.app', name: 'Test User' })
  .then((result) => {
    if (result.ok) {
      console.log('Test trial reminder email sent successfully.');
    } else {
      console.error('Failed to send test trial reminder email:', result.details);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred while sending the test email:', error);
    process.exit(1);
  });
