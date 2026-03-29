import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/utils/errors";

let client: S3Client | null = null;

function getS3Client() {
  const env = getEnv();
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET) {
    throw new AppError(
      "S3 storage is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET.",
      500,
      "storage_not_configured"
    );
  }

  if (!client) {
    client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.AWS_S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(env.AWS_S3_ENDPOINT),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  return client;
}

export function createStorageKey(userId: string, filename: string) {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${userId}/${Date.now()}-${safeFilename}`;
}

export async function createSignedUploadUrl(storageKey: string, mimeType: string) {
  const env = getEnv();
  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: storageKey,
    ContentType: mimeType
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: env.UPLOAD_URL_TTL_SECONDS
  });

  return {
    uploadUrl,
    method: "PUT" as const
  };
}

export async function getStoredObject(storageKey: string) {
  const env = getEnv();
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: storageKey
  });

  const response = await s3.send(command);
  const arrayBuffer = await response.Body?.transformToByteArray();

  if (!arrayBuffer) {
    throw new AppError("Uploaded document could not be read from storage.", 500, "storage_read_failed");
  }

  return Buffer.from(arrayBuffer);
}

