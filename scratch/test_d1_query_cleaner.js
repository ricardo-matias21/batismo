function cleanSql(sql) {
  return sql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Collapse whitespaces
    .trim()
    .replace(/;$/, ''); // Remove trailing semicolon
}

const sql1 = `
  CREATE TABLE IF NOT EXISTS utilizadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    papel TEXT CHECK(papel IN ('admin', 'utilizador')) NOT NULL DEFAULT 'utilizador'
  );
`;

console.log("Cleaned SQL 1:", cleanSql(sql1));
