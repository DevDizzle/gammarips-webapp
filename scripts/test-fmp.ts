const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let key = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/FMP_API_KEY=(.*)/);
  if (match) {
    key = match[1].trim();
  }
}

if (!key) {
  console.error("No FMP Key found in .env.local");
  process.exit(1);
}

const symbols = "SPY,^VIX,^TNX,CLUSD,PCR,CPC";
const url = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${key}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.error("Error parsing JSON", e);
      console.log("Raw:", data);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});