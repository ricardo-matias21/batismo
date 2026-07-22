const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

const fs = require('fs');

const batismoEnvPath = path.resolve(__dirname, 'batismo.env');
if (fs.existsSync(batismoEnvPath)) {
  dotenv.config({ path: batismoEnvPath });
}
dotenv.config();

const dbPath = path.resolve(__dirname, process.env.DB_FILE || 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Wrapper Promisificado para SQLite / D1
const dbAsync = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

async function initDatabase() {
  await dbAsync.run('PRAGMA foreign_keys = ON');

  // 1. Tabela utilizadores
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS utilizadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      papel TEXT CHECK(papel IN ('admin', 'utilizador')) NOT NULL DEFAULT 'utilizador'
    );
  `);

  // 2. Tabela tarefas
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      titulo_en TEXT,
      descricao_en TEXT,
      atribuida_a INTEGER,
      criada_por INTEGER,
      tarefa_pai_id INTEGER,
      estado TEXT CHECK(estado IN ('pendente', 'concluida')) NOT NULL DEFAULT 'pendente',
      FOREIGN KEY (atribuida_a) REFERENCES utilizadores(id) ON DELETE SET NULL,
      FOREIGN KEY (criada_por) REFERENCES utilizadores(id) ON DELETE SET NULL,
      FOREIGN KEY (tarefa_pai_id) REFERENCES tarefas(id) ON DELETE SET NULL
    );
  `);

  // Migração automática de colunas tarefa_pai_id, titulo_en e descricao_en
  try {
    const columns = await dbAsync.all('PRAGMA table_info(tarefas)');
    const colNames = columns.map(col => col.name);

    if (!colNames.includes('tarefa_pai_id')) {
      console.log('🔄 A adicionar coluna tarefa_pai_id à tabela tarefas...');
      await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN tarefa_pai_id INTEGER REFERENCES tarefas(id) ON DELETE SET NULL;');
    }
    if (!colNames.includes('titulo_en')) {
      console.log('🔄 A adicionar coluna titulo_en à tabela tarefas...');
      await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN titulo_en TEXT;');
    }
    if (!colNames.includes('descricao_en')) {
      console.log('🔄 A adicionar coluna descricao_en à tabela tarefas...');
      await dbAsync.exec('ALTER TABLE tarefas ADD COLUMN descricao_en TEXT;');
    }
  } catch (err) {
    console.error('Nota na verificação de migração de colunas:', err.message);
  }

  // 3. Tabela anexos_tarefa
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS anexos_tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarefa_id INTEGER NOT NULL,
      url_ficheiro TEXT NOT NULL,
      tipo_ficheiro TEXT CHECK(tipo_ficheiro IN ('imagem', 'video')) NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
    );
  `);

  // Seed inicial de contas caso a tabela utilizadores esteja vazia
  const { count } = await dbAsync.get('SELECT COUNT(*) as count FROM utilizadores');

  if (count === 0) {
    console.log('🌱 A semear utilizadores iniciais na base de dados (D1/SQLite)...');
    
    const hashAdmin = bcrypt.hashSync('osm2026', 10);
    const hashUser1 = bcrypt.hashSync('soutuga', 10);

    await dbAsync.run(
      'INSERT INTO utilizadores (nome, password_hash, papel) VALUES (?, ?, ?)',
      ['admin', hashAdmin, 'admin']
    );
    await dbAsync.run(
      'INSERT INTO utilizadores (nome, password_hash, papel) VALUES (?, ?, ?)',
      ['thomaz', hashUser1, 'utilizador']
    );

    console.log('✅ Utilizadores semeados com sucesso! (Admin: admin / osm2026 | User: thomaz / soutuga)');
  }
}

initDatabase().catch(err => console.error('Erro na inicialização da BD:', err));

module.exports = dbAsync;
