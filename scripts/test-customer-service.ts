
import { config } from 'dotenv';
config();

import { customerServiceFlow } from '../src/ai/flows/customer-service-agent';

async function test() {
  try {
    const result = await customerServiceFlow({
      question: "Is this financial advice?"
    });
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
