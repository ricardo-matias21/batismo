-- Schema Completo para Cloudflare D1 (SQL) - O Batismo Português

-- 1. Tabela utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  papel TEXT CHECK(papel IN ('admin', 'utilizador')) NOT NULL DEFAULT 'utilizador'
);

-- 2. Tabela tarefas
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

-- 3. Tabela anexos_tarefa
CREATE TABLE IF NOT EXISTS anexos_tarefa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tarefa_id INTEGER NOT NULL,
  url_ficheiro TEXT NOT NULL,
  tipo_ficheiro TEXT CHECK(tipo_ficheiro IN ('imagem', 'video')) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
);

-- 4. Adicionar colunas caso a tabela tarefas já exista no D1
ALTER TABLE tarefas ADD COLUMN titulo_en TEXT;
ALTER TABLE tarefas ADD COLUMN descricao_en TEXT;
ALTER TABLE tarefas ADD COLUMN tarefa_pai_id INTEGER REFERENCES tarefas(id) ON DELETE SET NULL;
