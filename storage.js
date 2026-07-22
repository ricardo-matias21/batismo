const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const batismoEnvPath = path.resolve(__dirname, 'batismo.env');
if (fs.existsSync(batismoEnvPath)) {
  dotenv.config({ path: batismoEnvPath });
}
dotenv.config();

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL
} = process.env;

const isR2Configured = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME;

let s3Client = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Uploads a file buffer or stream to Cloudflare R2 or local fallback
 * @param {Object} file Multer file object
 * @returns {Promise<string>} Public URL of the uploaded file
 */
async function uploadFile(file) {
  const extension = path.extname(file.originalname) || '';
  const fileKey = `batismo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${extension}`;

  if (isR2Configured && s3Client) {
    console.log(`☁️ A carregar ficheiro para Cloudflare R2 (${R2_BUCKET_NAME})...`);
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    const baseUrl = R2_PUBLIC_URL ? R2_PUBLIC_URL.replace(/\/$/, '') : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.dev`;
    return `${baseUrl}/${fileKey}`;
  } else {
    // Armazenamento local de reserva (public/uploads/)
    console.log('📁 Armazenamento R2 não configurado. Guardando ficheiro localmente em public/uploads/');
    const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, fileKey);
    fs.writeFileSync(localFilePath, file.buffer);
    return `/uploads/${fileKey}`;
  }
}

module.exports = {
  uploadFile,
  isR2Configured: !!isR2Configured,
};
