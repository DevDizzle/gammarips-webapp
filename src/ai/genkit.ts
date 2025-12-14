import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
      googleAI({
            // Uses your AI Studio key. Make sure GEMINI_API_KEY is set in the env.
                  apiKey: process.env.GEMINI_API_KEY,
                      }),
                        ],

                          // Optional default model – flows/prompts can override.
                            model: googleAI.model('gemini-2.0-flash'),
                            });
                            