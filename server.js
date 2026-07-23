const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v2 } = require('@google-cloud/translate');
const https = require('https');
const fs = require('fs');

// Carregar variáveis de ambiente: .env primeiro (valores base), batismo.env depois (sobrescreve)
dotenv.config(); // .env base
['batismo.env'].forEach(envFileName => {
  const envFilePath = path.resolve(__dirname, envFileName);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true }); // batismo.env tem prioridade máxima
  }
});

const db = require('./database');
const { uploadFile } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'o_batismo_portugues_segredo_super_seguro_2026';

// Google Cloud Translation API Client
const GOOGLE_TRANSLATE_API_KEY = (process.env.GOOGLE_TRANSLATE_API_KEY || '').trim();
let translator = null;
if (GOOGLE_TRANSLATE_API_KEY) {
  translator = new v2.Translate({ key: GOOGLE_TRANSLATE_API_KEY });
  console.log('🌐 Google Cloud Translation API Client inicializado com sucesso!');
} else {
  console.log('ℹ️ GOOGLE_TRANSLATE_API_KEY não detetada. A utilizar motor com dicionário de gírias académicas.');
}

/**
 * Dicionário de expressões festivas e académicas portuguesas para tradução contextual
 */
function replacePortugueseSlang(text) {
  if (!text) return '';
  let updated = text;

  const slangMap = [
    { pt: /mamar (uma )?mini de penalti/gi, en: 'Chug a mini beer in one shot' },
    { pt: /mamar (uma )?mini/gi, en: 'Chug a mini beer' },
    { pt: /virar (uma )?mini de penalti/gi, en: 'Down a mini beer in one shot' },
    { pt: /virar (uma )?mini/gi, en: 'Down a mini beer' },
    { pt: /mini de penalti/gi, en: 'Mini beer in one shot' },
    { pt: /de penalti/gi, en: 'in one shot' },
    { pt: /imperiais bem geladas/gi, en: 'ice-cold draft beers' },
    { pt: /imperiais/gi, en: 'draft beers' },
    { pt: /imperial/gi, en: 'draft beer' },
    { pt: /trajo académico/gi, en: 'traditional academic attire' },
    { pt: /trajo tradicional/gi, en: 'traditional student attire' },
    { pt: /o batismo português/gi, en: 'The Portuguese Baptism' }
  ];

  slangMap.forEach(item => {
    updated = updated.replace(item.pt, item.en);
  });

  return updated;
}

/**
 * Tradução de reserva via HTTP com suporte a gírias académicas
 */
function translateFreeHttp(text) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) return resolve('');

    // Pre-processar gírias conhecidas
    const preProcessed = replacePortugueseSlang(text);

    // Se já foi totalmente traduzido pelo dicionário de gírias
    if (preProcessed !== text && !/[áàãâéêíóôõúç]/i.test(preProcessed)) {
      return resolve(preProcessed);
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let translated = parsed[0].map(item => item[0]).join('');
          
          // Aplicar pós-processamento de gírias se o Google Translate traduziu à letra
          translated = translated.replace(/sucking a mini penalty/gi, 'Chug a mini beer in one shot');
          translated = translated.replace(/mini penalty/gi, 'mini beer in one shot');
          
          resolve(translated || text);
        } catch (e) {
          resolve(replacePortugueseSlang(text));
        }
      });
    }).on('error', () => resolve(replacePortugueseSlang(text)));
  });
}

/**
 * Traduz título e descrição de tarefas usando Google Cloud Translation API (modelo NMT otimizado) ou motor contextual de reserva
 */
async function translateTaskWithGoogle(titulo, descricao) {
  const translateOptions = {
    from: 'pt',
    to: 'en',
    model: 'nmt'
  };

  if (translator) {
    try {
      console.log('🌐 A traduzir tarefa via Google Cloud Translation API (PT -> EN, modelo NMT)...');
      let titulo_en = titulo;
      let descricao_en = descricao || '';

      if (titulo && titulo.trim()) {
        const prepTitulo = replacePortugueseSlang(titulo);
        const [transTitle] = await translator.translate(prepTitulo, translateOptions);
        titulo_en = transTitle;
      }
      if (descricao && descricao.trim()) {
        const prepDesc = replacePortugueseSlang(descricao);
        const [transDesc] = await translator.translate(prepDesc, translateOptions);
        descricao_en = transDesc;
      }

      console.log('✨ Tradução Google Cloud Translation (NMT) concluída com sucesso!');
      return { titulo_en, descricao_en };
    } catch (err) {
      console.error('⚠️ Erro na Google Cloud Translation API (NMT):', err.message);
    }
  }

  // Fallback automático de tradução se a API do Google Cloud Translation falhar ou não tiver chave
  console.log('🌐 A traduzir tarefa via motor contextual NMT de reserva (PT -> EN)...');
  const titulo_en = await translateFreeHttp(titulo);
  const descricao_en = await translateFreeHttp(descricao);
  return { titulo_en, descricao_en };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer memory storage (buffers para Cloudflare R2 ou Armazenamento Local)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // limite de 50MB
});

// Middleware de Autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, utilizador) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.utilizador = utilizador;
    next();
  });
}

// Middleware Apenas Admin
function apenasAdmin(req, res, next) {
  if (req.utilizador && req.utilizador.papel === 'admin') {
    return next();
  }
  return res.status(403).json({ erro: 'Ação permitida apenas a administradores.' });
}

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { nome, password } = req.body;

  if (!nome || !password) {
    return res.status(400).json({ erro: 'Nome e palavra-passe são obrigatórios.' });
  }

  try {
    const utilizador = await db.get('SELECT * FROM utilizadores WHERE nome = ?', [nome]);

    if (!utilizador) {
      return res.status(401).json({ erro: 'Utilizador não encontrado.' });
    }

    const passwordValida = bcrypt.compareSync(password, utilizador.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ erro: 'Palavra-passe incorreta.' });
    }

    const payload = {
      id: utilizador.id,
      nome: utilizador.nome,
      papel: utilizador.papel
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      mensagem: 'Login efetuado com sucesso!',
      token,
      utilizador: payload
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// Perfil do utilizador ligado
app.get('/api/auth/me', autenticarToken, (req, res) => {
  res.json({ utilizador: req.utilizador });
});

// ==========================================
// ROTAS DE UTILIZADORES (ADMIN)
// ==========================================

// Listar utilizadores (Apenas Admin)
app.get('/api/users', autenticarToken, apenasAdmin, async (req, res) => {
  try {
    const utilizadores = await db.all('SELECT id, nome, papel FROM utilizadores ORDER BY nome ASC');
    res.json(utilizadores);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar utilizadores.' });
  }
});

// Criar novo utilizador/admin (Apenas Admin)
app.post('/api/users', autenticarToken, apenasAdmin, async (req, res) => {
  const { nome, password, papel } = req.body;

  if (!nome || !password) {
    return res.status(400).json({ erro: 'Nome e palavra-passe são obrigatórios.' });
  }

  const papelFinal = papel === 'admin' ? 'admin' : 'utilizador';

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO utilizadores (nome, password_hash, papel) VALUES (?, ?, ?)',
      [nome, hash, papelFinal]
    );

    res.status(201).json({
      mensagem: 'Utilizador criado com sucesso!',
      utilizador: { id: result.lastInsertRowid, nome, papel: papelFinal }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ erro: 'Já existe um utilizador com este nome.' });
    }
    console.error('Erro ao criar utilizador:', err);
    res.status(500).json({ erro: 'Erro interno ao criar utilizador.' });
  }
});

// ==========================================
// ROTAS DE TAREFAS (CRUD & PUBLIC)
// ==========================================

// Listar todas as tarefas (PÚBLICO - Visitantes e Utilizadores)
app.get('/api/tasks', async (req, res) => {
  try {
    const tarefas = await db.all('SELECT t.id, t.titulo, t.descricao, t.titulo_en, t.descricao_en, t.estado, t.atribuida_a, t.criada_por, t.tarefa_pai_id, tp.titulo AS tarefa_pai_titulo, tp.titulo_en AS tarefa_pai_titulo_en, tp.estado AS tarefa_pai_estado, u_atrib.nome AS atribuida_a_nome, u_cria.nome AS criada_por_nome FROM tarefas t LEFT JOIN tarefas tp ON t.tarefa_pai_id = tp.id LEFT JOIN utilizadores u_atrib ON t.atribuida_a = u_atrib.id LEFT JOIN utilizadores u_cria ON t.criada_por = u_cria.id ORDER BY t.id DESC');

    const todosAnexos = await db.all('SELECT id, tarefa_id, url_ficheiro, tipo_ficheiro, criado_em FROM anexos_tarefa');

    // Mapear anexos para as respetivas tarefas
    const tarefasComAnexos = tarefas.map(t => {
      return {
        ...t,
        anexos: todosAnexos.filter(a => a.tarefa_id === t.id)
      };
    });

    res.json(tarefasComAnexos);
  } catch (err) {
    console.error('Erro ao procurar tarefas:', err);
    res.status(500).json({ erro: 'Erro ao carregar lista de tarefas.' });
  }
});

// Criar nova tarefa (Apenas Admin) + Tradução Automática
app.post('/api/tasks', autenticarToken, apenasAdmin, async (req, res) => {
  const { titulo, descricao, atribuida_a, tarefa_pai_id } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'O título da tarefa é obrigatório.' });
  }

  const paiIdParsed = tarefa_pai_id ? parseInt(tarefa_pai_id, 10) : null;

  try {
    // Fazer tradução automática para Inglês
    const { titulo_en, descricao_en } = await translateTaskWithGoogle(titulo, descricao);

    const result = await db.run(
      `INSERT INTO tarefas (titulo, descricao, titulo_en, descricao_en, atribuida_a, criada_por, tarefa_pai_id, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [titulo, descricao || '', titulo_en, descricao_en, atribuida_a || null, req.utilizador.id, paiIdParsed]
    );

    res.status(201).json({
      mensagem: 'Tarefa criada com sucesso!',
      tarefa_id: result.lastInsertRowid,
      titulo_en,
      descricao_en
    });
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    res.status(500).json({ erro: 'Erro interno ao criar tarefa.' });
  }
});

// Atualizar estado / dados da tarefa
app.put('/api/tasks/:id', autenticarToken, async (req, res) => {
  const tarefaId = req.params.id;
  const { estado, titulo, descricao, atribuida_a, tarefa_pai_id } = req.body;

  try {
    const tarefa = await db.get('SELECT t.*, tp.estado AS tarefa_pai_estado FROM tarefas t LEFT JOIN tarefas tp ON t.tarefa_pai_id = tp.id WHERE t.id = ?', [tarefaId]);

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    const isAdmin = req.utilizador.papel === 'admin';

    // Se estiver a tentar marcar como concluída mas a tarefa pai não estiver concluída
    if (estado === 'concluida' && tarefa.tarefa_pai_id && tarefa.tarefa_pai_estado !== 'concluida') {
      return res.status(400).json({ erro: 'Esta tarefa está bloqueada até que a tarefa pai seja concluída.' });
    }

    const novoEstado = estado || tarefa.estado;
    const novoTitulo = isAdmin && titulo !== undefined ? titulo : tarefa.titulo;
    const novaDescricao = isAdmin && descricao !== undefined ? descricao : tarefa.descricao;
    const novaAtribuicao = isAdmin && atribuida_a !== undefined ? atribuida_a : tarefa.atribuida_a;
    const novaTarefaPai = isAdmin && tarefa_pai_id !== undefined ? (tarefa_pai_id ? parseInt(tarefa_pai_id, 10) : null) : tarefa.tarefa_pai_id;

    let novoTituloEn = tarefa.titulo_en;
    let novaDescricaoEn = tarefa.descricao_en;

    // Recalcular tradução se o admin alterou título ou descrição
    if (isAdmin && (titulo !== undefined || descricao !== undefined)) {
      const translation = await translateTaskWithGoogle(novoTitulo, novaDescricao);
      novoTituloEn = translation.titulo_en;
      novaDescricaoEn = translation.descricao_en;
    }

    await db.run(
      'UPDATE tarefas SET estado = ?, titulo = ?, descricao = ?, titulo_en = ?, descricao_en = ?, atribuida_a = ?, tarefa_pai_id = ? WHERE id = ?',
      [novoEstado, novoTitulo, novaDescricao, novoTituloEn, novaDescricaoEn, novaAtribuicao, novaTarefaPai, tarefaId]
    );

    res.json({ mensagem: 'Tarefa atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar tarefa.' });
  }
});

// Eliminar tarefa (Apenas Admin) — Cascata manual para compatibilidade com Cloudflare D1
app.delete('/api/tasks/:id', autenticarToken, apenasAdmin, async (req, res) => {
  const tarefaId = parseInt(req.params.id, 10);

  try {
    // 1. Verificar que a tarefa existe
    const tarefa = await db.get('SELECT id FROM tarefas WHERE id = ?', [tarefaId]);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    // 2. Eliminar todos os anexos da tarefa (a D1 não faz CASCADE automaticamente via REST)
    await db.run('DELETE FROM anexos_tarefa WHERE tarefa_id = ?', [tarefaId]);

    // 3. Desligar tarefas filhas (remover a referência pai para não ficarem órfãs bloqueadas)
    await db.run('UPDATE tarefas SET tarefa_pai_id = NULL WHERE tarefa_pai_id = ?', [tarefaId]);

    // 4. Eliminar a tarefa em si
    const result = await db.run('DELETE FROM tarefas WHERE id = ?', [tarefaId]);

    if (result.changes === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    res.json({ mensagem: 'Tarefa eliminada com sucesso!' });
  } catch (err) {
    console.error('Erro ao eliminar tarefa:', err);
    res.status(500).json({ erro: 'Erro ao eliminar tarefa: ' + err.message });
  }
});


// Upload de Comprovativo (Foto ou Vídeo) para Cloudflare R2 / Armazenamento
app.post('/api/tasks/:id/upload', autenticarToken, upload.single('ficheiro'), async (req, res) => {
  const tarefaId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum ficheiro enviado.' });
  }

  try {
    const tarefa = await db.get('SELECT t.*, tp.estado AS tarefa_pai_estado FROM tarefas t LEFT JOIN tarefas tp ON t.tarefa_pai_id = tp.id WHERE t.id = ?', [tarefaId]);

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    if (tarefa.tarefa_pai_id && tarefa.tarefa_pai_estado !== 'concluida') {
      return res.status(400).json({ erro: 'Esta tarefa está bloqueada até que a tarefa pai seja concluída.' });
    }

    // Determinar se é imagem ou vídeo
    const mime = req.file.mimetype;
    let tipoFicheiro = 'imagem';
    if (mime.startsWith('video/')) {
      tipoFicheiro = 'video';
    }

    // Fazer upload para Cloudflare R2 / Storage local
    const urlFicheiro = await uploadFile(req.file);

    // Registar anexo na base de dados
    await db.run('INSERT INTO anexos_tarefa (tarefa_id, url_ficheiro, tipo_ficheiro) VALUES (?, ?, ?)', [tarefaId, urlFicheiro, tipoFicheiro]);

    // Mudar estado da tarefa automaticamente para "concluida"
    await db.run("UPDATE tarefas SET estado = 'concluida' WHERE id = ?", [tarefaId]);

    res.json({
      mensagem: 'Comprovativo enviado e tarefa marcada como Concluída!',
      url: urlFicheiro,
      tipo: tipoFicheiro
    });
  } catch (err) {
    console.error('Erro no upload de comprovativo:', err);
    res.status(500).json({ erro: 'Erro ao processar ficheiro comprovativo.' });
  }
});

// Iniciar Servidor Express
app.listen(PORT, () => {
  console.log(`
🍺 =================================================== 🍺
   O BATISMO PORTUGUÊS - E É ASSIM A VIDA
   Servidor a correr na porta: http://localhost:${PORT}
🍺 =================================================== 🍺
  `);
});
