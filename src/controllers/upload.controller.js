const AWS = require("aws-sdk");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    signatureVersion: "v4"
});

exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const params = {
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        const result = await s3.upload(params).promise();
        res.json({ url: result.Location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadMiddleware = upload.single("file");
