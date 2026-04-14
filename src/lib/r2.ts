// Cloudflare R2 / S3 Client Placeholder
// Cần cài đặt @aws-sdk/client-s3 nếu muốn dùng thực tế
export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,
};
