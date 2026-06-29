import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const R2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC = process.env.R2_PUBLIC_URL!;

// ── Subir imagen ──────────────────────────────────────────────
export async function uploadImage(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = "products"
): Promise<string> {
    const key = `${folder}/${Date.now()}-${filename.replace(/\s+/g, "-")}`;

    await R2.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return `${PUBLIC}/${key}`;
}

// ── Eliminar imagen ───────────────────────────────────────────
export async function deleteImage(url: string): Promise<void> {
    // Extraer la key de la URL pública
    const key = url.replace(`${PUBLIC}/`, "");

    await R2.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })
    );
}