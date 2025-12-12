'use server';

import { chatRouterFlow } from '@/ai/flows/chat-router';

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export async function submitChatQuery(
  input: string,
  history: ChatMessage[] = []
) {
  try {
    const result = await chatRouterFlow({
      userInput: input,
      history: history,
    });

    return {
      success: true,
      answer: result.response,
      source: result.source,
    };
  } catch (error) {
    console.error('Error in submitChatQuery:', error);
    return {
      success: false,
      answer: "I apologize, but I'm having trouble connecting to my cognitive services right now. Please try again in a moment.",
      source: 'error',
    };
  }
}
