import { chatRouterFlow } from '@/ai/flows/chat-router';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Testing Chat Router...');
  
  // Test Case 1: Financial Question (Should route to ProfitScout)
  try {
    console.log('\n--- Test 1: Financial Question ---');
    const resultFinance = await chatRouterFlow({
      userInput: "What is the current price of NVDA?",
      history: []
    });
    console.log('Source:', resultFinance.source);
    console.log('Response:', resultFinance.response);
  } catch (error) {
    console.error('Error in Finance Test:', error);
  }

  // Test Case 2: Service Question (Should route to Customer Service)
  try {
    console.log('\n--- Test 2: Service Question ---');
    const resultService = await chatRouterFlow({
        userInput: "How do I reset my password?",
        history: []
    });
    console.log('Source:', resultService.source);
    console.log('Response:', resultService.response);
  } catch (error) {
    console.error('Error in Service Test:', error);
  }
}

main();
