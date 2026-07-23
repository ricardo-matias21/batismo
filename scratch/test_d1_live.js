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

// Usar as credenciais do batismo.env ou hardcoded para teste
const CF_ACCOUNT_ID = (process.env.CLOUDFLARE_ACCOUNT_ID || 'c254510c278461a3b120d355ea5bd6c6').trim();
const CF_DATABASE_ID = (process.env.CLOUDFLARE_DATABASE_ID || '5e45ffc6-e2b1-4270-a715-a8149b59cefa').trim();
const CF_API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || '').trim();

console.log('=== Diagnóstico Cloudflare D1 ===');
console.log('Account ID:', CF_ACCOUNT_ID ? CF_ACCOUNT_ID.substring(0, 8) + '...' : '❌ VAZIO');
console.log('Database ID:', CF_DATABASE_ID ? CF_DATABASE_ID.substring(0, 8) + '...' : '❌ VAZIO');
console.log('API Token:', CF_API_TOKEN ? CF_API_TOKEN.substring(0, 8) + '...' : '❌ VAZIO');

if (!CF_API_TOKEN) {
  console.error('\n❌ CLOUDFLARE_API_TOKEN não está definido! Precisas de o definir no batismo.env.');
  process.exit(1);
}

function queryD1(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Limpar SQL para D1
    const cleanedSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim().replace(/;$/, '');
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;
    const bodyData = JSON.stringify({ sql: cleanedSql, params });

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
        try {
          const parsed = JSON.parse(responseBody);
          if (!parsed.success) {
            const errMsg = parsed.errors?.[0]?.message || `HTTP ${res.statusCode}`;
            return reject(new Error(`D1 API Error: ${errMsg}\nRaw: ${responseBody.substring(0, 300)}`));
          }
          resolve(parsed.result?.[0] || {});
        } catch (e) {
          reject(new Error(`JSON Parse Error: ${responseBody.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(bodyData);
    req.end();
  });
}

async function run() {
  try {
    console.log('\n1. Testando SELECT nas tabelas...');
    const tables = await queryD1("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('✅ Tabelas na D1:', tables.results?.map(r => r.name).join(', ') || '(nenhuma)');

    console.log('\n2. Testando SELECT na tabela utilizadores...');
    const users = await queryD1('SELECT id, nome, papel FROM utilizadores');
    console.log('✅ Utilizadores na D1:', users.results?.length || 0, 'registos');
    if (users.results?.length > 0) {
      users.results.forEach(u => console.log(`  - ${u.id}: ${u.nome} (${u.papel})`));
    }

    console.log('\n3. Testando SELECT na tabela tarefas...');
    const tasks = await queryD1('SELECT id, titulo, estado FROM tarefas');
    console.log('✅ Tarefas na D1:', tasks.results?.length || 0, 'registos');

    console.log('\n✅ Cloudflare D1 está a funcionar corretamente!');
  } catch (err) {
    console.error('\n❌ ERRO NA CLOUDFLARE D1:', err.message);
  }
}

run();
