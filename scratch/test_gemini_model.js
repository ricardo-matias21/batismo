const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const batismoEnvPath = path.resolve(process.cwd(), 'batismo.env');
console.log("Checking batismoEnvPath:", batismoEnvPath, fs.existsSync(batismoEnvPath));
if (fs.existsSync(batismoEnvPath)) {
  dotenv.config({ path: batismoEnvPath });
}
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim();
console.log("GEMINI_API_KEY present?", !!GEMINI_API_KEY);

if (!GEMINI_API_KEY) {
  console.log("No API key found.");
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function testGemini(modelName) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const prompt = `És um tradutor especialista em cultura universitária e tradições académicas portuguesas (como o 'Batismo Português').
Traduz a seguinte tarefa de Português para Inglês mantendo o espírito jovem, descontraído e festivo.
Gírias portuguesas como 'mamar uma mini de penalti' devem ser traduzidas para expressões de festa naturais em inglês (ex: 'Chug a small beer in one shot').

Devolve APENAS um JSON válido com a chave "titulo_en" e "descricao_en".

Título: Mamar uma mini de penalti
Descrição: Ir ao balcão e virar a cerveja sem parar`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    console.log(`SUCCESS [${modelName}]:`, response.text);
  } catch (err) {
    console.error(`ERROR [${modelName}]:`, err.message);
  }
}

async function run() {
  await testGemini('gemini-2.0-flash');
  await testGemini('gemini-1.5-flash');
}

run();
