
import { config } from 'dotenv';
config();

import { sendFeedbackRequestEmail } from '@/lib/mailgun';

console.log('Attempting to send a test feedback request email...');

sendFeedbackRequestEmail({ to: 'eraphaelparra@gmail.com', name: 'Test User' })
  .then((result) => {
    if (result.ok) {
      console.log('Test feedback request email sent successfully.');
    } else {
      console.error('Failed to send test feedback request email:', result.details);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred while sending the test email:', error);
    process.exit(1);
  });
