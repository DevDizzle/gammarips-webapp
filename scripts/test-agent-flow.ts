
import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load env vars

import { groundedQaFlow } from '../src/ai/flows/grounded-qa-flow';
import { customerServiceFlow } from '../src/ai/flows/customer-service-agent';

async function runTest() {
  console.log("=== Testing Customer Service Flow (Policy Tool) ===");
  try {
    const serviceResponse = await customerServiceFlow({
      question: "What is your refund policy?",
      history: []
    });
    console.log("Service Agent Response:", JSON.stringify(serviceResponse, null, 2));
  } catch (error) {
    console.error("Service Agent Failed:", error);
  }

  console.log("\n=== Testing Grounded QA Flow (Financial Tool) ===");
  try {
    const financeResponse = await groundedQaFlow({
      question: "What is the current price of NVDA?",
      history: []
    });
    console.log("Finance Agent Response:", JSON.stringify(financeResponse, null, 2));
  } catch (error) {
    console.error("Finance Agent Failed:", error);
  }
}

runTest();
