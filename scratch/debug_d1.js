const https = require('https');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

['batismo.env', '.env'].forEach(envFileName => {
  const envFilePath = path.resolve(__dirname, '..', envFileName);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
  }
});
dotenv.config();

const CF_ACCOUNT_ID = (process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || process.env.D1_ACCOUNT_ID || '').trim();
const CF_DATABASE_ID = (process.env.CLOUDFLARE_DATABASE_ID || process.env.CF_DATABASE_ID || process.env.D1_DATABASE_ID || '').trim();
const CF_API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.D1_API_TOKEN || process.env.CLOUDFLARE_TOKEN || '').trim();

console.log("=== CLOUDFLARE D1 DIAGNOSTIC ===");
console.log("ACCOUNT_ID present?", !!CF_ACCOUNT_ID, CF_ACCOUNT_ID ? `(${CF_ACCOUNT_ID.substring(0, 5)}...)` : '');
console.log("DATABASE_ID present?", !!CF_DATABASE_ID, CF_DATABASE_ID ? `(${CF_DATABASE_ID.substring(0, 5)}...)` : '');
console.log("API_TOKEN present?", !!CF_API_TOKEN, CF_API_TOKEN ? `(${CF_API_TOKEN.substring(0, 5)}...)` : '');

if (!CF_ACCOUNT_ID || !CF_DATABASE_ID || !CF_API_TOKEN) {
  console.error("❌ Faltam variáveis de ambiente para comunicar com a Cloudflare D1.");
  process.exit(1);
}

function testD1Query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;
    const bodyData = JSON.stringify({ sql, params });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyData)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        console.log(`HTTP Status: ${res.statusCode}`);
        console.log("Raw Response Body:", responseBody);
        try {
          const parsed = JSON.parse(responseBody);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(bodyData);
    req.end();
  });
}

async function run() {
  try {
    console.log("\n1. Testando SELECT sqlite_master...");
    const res = await testD1Query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Result tables:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("❌ ERROR Test D1:", err.message);
  }
}

run();
