import { config } from 'dotenv';
config();

import '@/ai/flows/initial-recommendation.ts';
import '@/ai/flows/feedback-summarization.ts';
import '@/ai/flows/follow-up-questions.ts';
import '@/ai/flows/send-daily-setups.ts';
import '@/ai/flows/send-trial-reminders.ts';
import '@/ai/flows/send-referral-links.ts';
import '@/ai/flows/send-feedback-requests.ts';
