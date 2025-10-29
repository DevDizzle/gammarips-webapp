
import { config } from 'dotenv';
config();

import { handleWelcomeEmail } from '@/app/actions';

console.log('Attempting to send a test welcome email...');

handleWelcomeEmail('admin@profitscout.app', 'Test User')
  .then((result) => {
    if (result.success) {
      console.log('Test welcome email sent successfully.');
    } else {
      console.error('Failed to send test welcome email.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred while sending the test welcome email:', error);
    process.exit(1);
  });
