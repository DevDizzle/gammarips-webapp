
import { config } from 'dotenv';
config();

import { sendReferralEmail } from '@/lib/mailgun';

console.log('Attempting to send a test referral email...');

sendReferralEmail({ to: 'eraphaelparra@gmail.com', name: 'Test User', referralLink: 'https://profitscout.app/?ref=TEST-UID-123' })
  .then((result) => {
    if (result.ok) {
      console.log('Test referral email sent successfully.');
    } else {
      console.error('Failed to send test referral email:', result.details);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('An error occurred while sending the test email:', error);
    process.exit(1);
  });
