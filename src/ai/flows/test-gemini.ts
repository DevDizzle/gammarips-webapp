// src/ai/flows/test-gemini.ts
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

ai.defineFlow('test-gemini', async () => {
  const { text } = await ai.generate({
    model: googleAI.model('gemini-2.5-pro'),
    prompt: 'Say hello from GammaRips.',
  });
  return text;
});
