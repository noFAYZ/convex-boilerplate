import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Config, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from "@/lib/r2-config";

const s3Client = new S3Client({
  region: "auto",
  endpoint: r2Config.endpoint,
  credentials: {
    accessKeyId: r2Config.accessKeyId || "",
    secretAccessKey: r2Config.secretAccessKey || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'avatar' | 'logo' | 'document'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    const sizeLimit = FILE_SIZE_LIMITS[type as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.document;
    if (file.size > sizeLimit) {
      return NextResponse.json(
        { error: `File size exceeds ${sizeLimit / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (type === "avatar" || type === "logo") {
      if (!ALLOWED_FILE_TYPES.image.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only images are allowed." },
          { status: 400 }
        );
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${type}/${timestamp}-${randomString}.${extension}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Generate public URL
    const publicUrl = r2Config.publicUrl
      ? `${r2Config.publicUrl}/${fileName}`
      : `${r2Config.endpoint}/${r2Config.bucketName}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
