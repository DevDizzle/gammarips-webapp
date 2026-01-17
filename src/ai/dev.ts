// src/ai/dev.ts
import { config } from 'dotenv';
config();

// Import the shared Genkit instance
import { ai } from '@/ai/genkit';

// Import all flows so they self-register
import '@/ai/flows/initial-recommendation';
import '@/ai/flows/feedback-summarization';
import '@/ai/flows/follow-up-questions';
import '@/ai/flows/send-daily-setups';
import '@/ai/flows/send-feedback-requests';
import '@/ai/flows/customer-service-agent';
import '@/ai/flows/send-top-pick';
import '@/ai/flows/grounded-qa-flow';
import '@/ai/flows/test-gemini';
import '@/ai/flows/customer-service-agent';
import '@/ai/flows/chat-router'; // Register the router
import '@/ai/flows/send-midday-movers';
import '@/ai/agents/profit-scout-agent';

// 👈 Genkit CLI expects a default export of the ai instance
export default ai;
