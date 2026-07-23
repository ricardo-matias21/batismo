const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente de batismo.env ou .env
['batismo.env', '.env'].forEach(envFileName => {
  const envFilePath = path.resolve(__dirname, envFileName);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
  }
});
dotenv.config();

/**
 * Obtém credenciais R2 atualizadas das variáveis de ambiente
 */
function getR2Credentials() {
  let accountId = (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '').trim();
  
  const endpoint = (process.env.CLOUDFLARE_R2_ENDPOINT || process.env.R2_ENDPOINT || '').trim();
  if (!accountId && endpoint) {
    const match = endpoint.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/i);
    if (match) accountId = match[1];
  }

  const accessKeyId = (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '').trim();
  const bucketName = (process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || process.env.BUCKET_NAME || 'batismo').trim();
  const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || '').trim();

  const isConfigured = !!(accountId && accessKeyId && secretAccessKey && bucketName);
  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl, endpoint, isConfigured };
}

/**
 * Upload de ficheiro para Cloudflare R2 ou armazenamento local de reserva
 * @param {Object} file Ficheiro recebido do Multer
 * @returns {Promise<string>} URL público do ficheiro
 */
async function uploadFile(file) {
  const extension = path.extname(file.originalname) || '';
  const fileKey = `batismo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${extension}`;
  
  const r2 = getR2Credentials();

  if (r2.isConfigured) {
    console.log(`☁️ A carregar ficheiro comprovativo para Cloudflare R2 (${r2.bucketName})...`);
    try {
      const endpointUrl = r2.endpoint || `https://${r2.accountId}.r2.cloudflarestorage.com`;
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: endpointUrl,
        credentials: {
          accessKeyId: r2.accessKeyId,
          secretAccessKey: r2.secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: r2.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      console.log(`✨ Ficheiro enviado com sucesso para a Cloudflare R2: ${fileKey}`);

      const baseUrl = r2.publicUrl ? r2.publicUrl.replace(/\/$/, '') : `https://${r2.bucketName}.${r2.accountId}.r2.dev`;
      return `${baseUrl}/${fileKey}`;
    } catch (err) {
      console.error('❌ Erro no upload para Cloudflare R2, a utilizar armazenamento local como reserva:', err.message);
    }
  }

  // Armazenamento local de reserva (public/uploads/)
  console.log('📁 Armazenamento R2 não configurado ou com erro. Guardando ficheiro localmente em public/uploads/');
  const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, fileKey);
  fs.writeFileSync(localFilePath, file.buffer);
  return `/uploads/${fileKey}`;
}

module.exports = {
  uploadFile,
  isR2Configured: () => getR2Credentials().isConfigured,
};
