import { z } from 'zod';

export const FeedbackSurveyDataSchema = z.object({
  perceivedValue: z.string(),
  mostUseful: z.string().optional(),
  improvementSuggestion: z.string(),
});
export type FeedbackSurveyData = z.infer<typeof FeedbackSurveyDataSchema>;
