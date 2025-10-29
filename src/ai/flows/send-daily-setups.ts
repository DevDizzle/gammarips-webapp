
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSubscribedUsersAdmin, getWinnersDashboardAdmin, type DbUser, type Winner } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';

const SendDailySetupsInputSchema = z.object({});
const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});

export async function sendDailySetups(_: z.infer<typeof SendDailySetupsInputSchema>)