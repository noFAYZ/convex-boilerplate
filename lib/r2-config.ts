// Cloudflare R2 Configuration
// R2 is S3-compatible, so we use the AWS SDK

export const r2Config = {
  // Add these to your .env.local:
  // R2_ACCOUNT_ID=your_account_id
  // R2_ACCESS_KEY_ID=your_access_key
  // R2_SECRET_ACCESS_KEY=your_secret_key
  // R2_BUCKET_NAME=your_bucket_name
  // R2_PUBLIC_URL=https://your-bucket.r2.dev (optional, for public files)

  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,

  // R2 endpoint format
  get endpoint() {
    return `https://${this.accountId}.r2.cloudflarestorage.com`;
  },
};

// File size limits
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  logo: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};
