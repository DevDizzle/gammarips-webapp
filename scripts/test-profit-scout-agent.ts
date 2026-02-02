import { profitScoutAgent } from '@/ai/agents/profit-scout-agent';
import { config } from 'dotenv';

config();

async function main() {
  console.log('Testing ProfitScout Agent...');
  
  try {
    const response = await profitScoutAgent({
      question: "What is the current price of AAPL and what is the sentiment?",
      history: []
    });

    console.log('Response:', response.text);
    process.exit(0);
  } catch (error) {
    console.error('Error running agent:', error);
    process.exit(1);
  }
}

main();
