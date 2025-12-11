import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Single Genkit instance for app
export const ai = genkit({
  plugins: [
    googleAI({
      // optional: you can pass { experimental_debugTraces: true } etc.
    }),
  ],
  // Default model – can override per prompt/flow if you want
  model: googleAI.model('gemini-2.5-pro'),
});
