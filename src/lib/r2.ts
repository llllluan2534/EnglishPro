import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import path from 'path'

export type UploadFolder = 'images' | 'audio' | 'video'

/** Kiểm tra xem R2 đã được cấu hình chưa */
function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCOUNT_ID !== 'your-r2-account-id' &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_ACCESS_KEY_ID !== 'your-access-key' &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_SECRET_ACCESS_KEY !== 'your-secret-key'
  )
}

/** Lazy init – chỉ tạo client khi thực sự cần, tránh crash lúc module load */
function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error(
      'R2 chưa được cấu hình. Vui lòng điền R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY vào file .env'
    )
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = () => {
  if (!process.env.R2_BUCKET_NAME) throw new Error('Thiếu biến môi trường R2_BUCKET_NAME')
  return process.env.R2_BUCKET_NAME
}
const PUBLIC_URL = () => process.env.R2_PUBLIC_URL ?? ''

/**
 * Upload trực tiếp buffer lên R2 (dùng trong Server Action)
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: UploadFolder = 'images'
): Promise<{ url: string; key: string }> {
  const client = getR2Client()
  const ext = path.extname(fileName)
  const key = `${folder}/${randomUUID()}${ext}`

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  return { url: `${PUBLIC_URL()}/${key}`, key }
}

/**
 * Tạo Pre-signed URL để client upload trực tiếp lên R2
 */
export async function getPresignedUploadUrl(
  fileName: string,
  mimeType: string,
  folder: UploadFolder = 'images'
): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  const client = getR2Client()
  const ext = path.extname(fileName)
  const key = `${folder}/${randomUUID()}${ext}`

  const presignedUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: 300 } // 5 phút
  )

  return { presignedUrl, publicUrl: `${PUBLIC_URL()}/${key}`, key }
}

/**
 * Xóa file trên R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET(),
      Key: key,
    })
  )
}
