import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;
const REGION = process.env.AWS_REGION || 'ap-south-1';

export function s3Url(key: string) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

export async function uploadToS3(
  file: File,
  folder: 'products' | 'screenshots'
): Promise<string> {
  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const key = `${folder}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type || 'image/jpeg',
  }));

  return s3Url(key);
}
