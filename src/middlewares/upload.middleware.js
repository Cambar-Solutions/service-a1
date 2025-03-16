const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

const s3 = new S3Client({
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, 
    region: "auto",
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY
    }
});

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage }).array("multimedia", 10);

const uploadToCloudflare = async (file) => {
    const fileKey = `products/${Date.now()}-${file.originalname}`;

    try {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype
        }));

        return {
            id: fileKey,
            url: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`, // 🔥 Aquí está la solución
            tipo: file.mimetype.startsWith("image/") ? "imagen" : "video"
        };
    } catch (error) {
        console.error("Error al subir a Cloudflare R2:", error);
        throw error;
    }
};

module.exports = { uploadMiddleware, uploadToCloudflare };
