const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');

// Carregar variáveis de ambiente de batismo.env ou .env
['batismo.env', '.env'].forEach(envFileName => {
  const envFilePath = path.resolve(__dirname, envFileName);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
  }
});
dotenv.config();

// Detetar credenciais da Cloudflare D1
let CF_ACCOUNT_ID = (process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || process.env.D1_ACCOUNT_ID || '').trim();

// Tentar extrair Account ID do endpoint da R2 se não estiver definido explicitamente
if (!CF_ACCOUNT_ID) {
  const endpoint = (process.env.CLOUDFLARE_R2_ENDPOINT || process.env.R2_ENDPOINT || '').trim();
  if (endpoint) {
    const match = endpoint.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/i);
    if (match) {
      CF_ACCOUNT_ID = match[1];
      console.log(`💡 Account ID extraído do R2 Endpoint: ${CF_ACCOUNT_ID.substring(0, 8)}...`);
    }
  }
}

const CF_DATABASE_ID = (process.env.CLOUDFLARE_DATABASE_ID || process.env.CF_DATABASE_ID || process.env.D1_DATABASE_ID || '').trim();
const CF_API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.D1_API_TOKEN || process.env.CLOUDFLARE_TOKEN || '').trim();

const isD1Configured = !!(CF_ACCOUNT_ID && CF_DATABASE_ID && CF_API_TOKEN);

// Log de diagnóstico de configuração
console.log('=== Configuração da Base de Dados ===');
console.log(`  CLOUDFLARE_ACCOUNT_ID: ${CF_ACCOUNT_ID ? '✅ ' + CF_ACCOUNT_ID.substring(0, 8) + '...' : '❌ Não definido'}`);
console.log(`  CLOUDFLARE_DATABASE_ID: ${CF_DATABASE_ID ? '✅ ' + CF_DATABASE_ID.substring(0, 8) + '...' : '❌ Não definido'}`);
console.log(`  CLOUDFLARE_API_TOKEN: ${CF_API_TOKEN ? '✅ ' + CF_API_TOKEN.substring(0, 8) + '...' : '❌ Não definido'}`);
console.log(`  Modo: ${isD1Configured ? '☁️ Cloudflare D1 (Produção)' : '📁 SQLite Local'}`);

let localDb = null;
if (!isD1Configured) {
  const dbPath = path.resolve(__dirname, process.env.DB_FILE || 'database.sqlite');
  localDb = new sqlite3.Database(dbPath);
  console.log(`  Ficheiro SQLite: ${dbPath}`);
}

/**
 * Limpa instrução SQL para envio correto à API REST da Cloudflare D1
 */
function cleanSql(sql) {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/;$/, '');
}

/**
 * Executa query SQL na API REST da Cloudflare D1
 */
function queryD1Http(sql, params = []) {
  return new Promise((resolve, reject) => {
    const cleanedSql = cleanSql(sql);
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
            const errMsg = parsed.errors?.[0]?.message || `Erro na Cloudflare D1 API (HTTP ${res.statusCode})`;
            console.error(`❌ D1 API: ${errMsg} | SQL: ${cleanedSql.substring(0, 80)}`);
            return reject(new Error(errMsg));
          }
          const resultObj = parsed.result?.[0] || {};
          resolve({
            results: resultObj.results || [],
            success: resultObj.success !== false,
            meta: resultObj.meta || {}
          });
        } catch (e) {
          console.error(`❌ D1 API resposta inválida:`, responseBody.substring(0, 200));
          reject(new Error('Resposta inválida da Cloudflare D1 API'));
        }
      });
    });

    req.on('error', err => {
      console.error(`❌ D1 conexão falhou:`, err.message);
      reject(err);
    });
    req.write(bodyData);
    req.end();
  });
}

// Wrapper Unificado para Cloudflare D1 REST API e SQLite Local
const dbAsync = {
  async run(sql, params = []) {
    if (isD1Configured) {
      const d1 = await queryD1Http(sql, params);
      return {
        lastInsertRowid: d1.meta.last_row_id || d1.meta.last_insert_rowid || 0,
        changes: d1.meta.changes || 0
      };
    } else {
      return new Promise((resolve, reject) => {
        localDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastInsertRowid: this.lastID, changes: this.changes });
        });
      });
    }
  },

  async get(sql, params = []) {
    if (isD1Configured) {
      const d1 = await queryD1Http(sql, params);
      return (d1.results && d1.results.length > 0) ? d1.results[0] : null;
    } else {
      return new Promise((resolve, reject) => {
        localDb.get(sql, params, (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        });
      });
    }
  },

  async all(sql, params = []) {
    if (isD1Configured) {
      const d1 = await queryD1Http(sql, params);
      return d1.results || [];
    } else {
      return new Promise((resolve, reject) => {
        localDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });
    }
  },

  async exec(sql) {
    if (isD1Configured) {
      await queryD1Http(sql, []);
    } else {
      return new Promise((resolve, reject) => {
        localDb.exec(sql, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }
};

async function initDatabase() {
  if (isD1Configured) {
    console.log(`\n☁️ A ligar à Cloudflare D1 (ID: ${CF_DATABASE_ID.substring(0, 8)}...)...`);
  } else {
    console.log('\n📁 A utilizar SQLite local...');
    await dbAsync.run('PRAGMA foreign_keys = ON');
  }

  // 1. Tabela utilizadores
  try {
    await dbAsync.exec(`CREATE TABLE IF NOT EXISTS utilizadores (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, papel TEXT CHECK(papel IN ('admin', 'utilizador')) NOT NULL DEFAULT 'utilizador')`);
  } catch (err) {
    console.error('⚠️ Nota ao criar tabela utilizadores:', err.message);
  }

  // 2. Tabela tarefas
  try {
    await dbAsync.exec(`CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT, titulo_en TEXT, descricao_en TEXT, atribuida_a INTEGER, criada_por INTEGER, tarefa_pai_id INTEGER, estado TEXT CHECK(estado IN ('pendente', 'concluida')) NOT NULL DEFAULT 'pendente', FOREIGN KEY (atribuida_a) REFERENCES utilizadores(id) ON DELETE SET NULL, FOREIGN KEY (criada_por) REFERENCES utilizadores(id) ON DELETE SET NULL, FOREIGN KEY (tarefa_pai_id) REFERENCES tarefas(id) ON DELETE SET NULL)`);
  } catch (err) {
    console.error('⚠️ Nota ao criar tabela tarefas:', err.message);
  }

  // Migração automática de colunas para SQLite local
  if (!isD1Configured) {
    try {
      const columns = await dbAsync.all('PRAGMA table_info(tarefas)');
      const colNames = columns.map(col => col.name);
      if (!colNames.includes('tarefa_pai_id')) await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN tarefa_pai_id INTEGER REFERENCES tarefas(id) ON DELETE SET NULL');
      if (!colNames.includes('titulo_en')) await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN titulo_en TEXT');
      if (!colNames.includes('descricao_en')) await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN descricao_en TEXT');
    } catch (err) {
      console.error('Nota na migração local:', err.message);
    }
  }

  // 3. Tabela anexos_tarefa
  try {
    await dbAsync.exec(`CREATE TABLE IF NOT EXISTS anexos_tarefa (id INTEGER PRIMARY KEY AUTOINCREMENT, tarefa_id INTEGER NOT NULL, url_ficheiro TEXT NOT NULL, tipo_ficheiro TEXT CHECK(tipo_ficheiro IN ('imagem', 'video')) NOT NULL, criado_em DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE)`);
  } catch (err) {
    console.error('⚠️ Nota ao criar tabela anexos_tarefa:', err.message);
  }

  // Seed inicial de utilizadores
  try {
    const row = await dbAsync.get('SELECT COUNT(*) as count FROM utilizadores');
    const count = row ? row.count : 0;
    if (count === 0) {
      console.log('🌱 A semear utilizadores iniciais...');
      await dbAsync.run('INSERT INTO utilizadores (nome, password_hash, papel) VALUES (?, ?, ?)', ['admin', bcrypt.hashSync('osm2026', 10), 'admin']);
      await dbAsync.run('INSERT INTO utilizadores (nome, password_hash, papel) VALUES (?, ?, ?)', ['thomaz', bcrypt.hashSync('soutuga', 10), 'utilizador']);
      console.log('✅ Utilizadores semeados! (admin / osm2026 | thomaz / soutuga)');
    } else {
      console.log(`✅ Base de dados pronta com ${count} utilizador(es).`);
    }
  } catch (err) {
    console.error('❌ Erro na semeação de utilizadores:', err.message);
  }
}

initDatabase().catch(err => console.error('Erro na inicialização da BD:', err));

module.exports = dbAsync;
