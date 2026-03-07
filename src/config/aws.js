import dotenv from 'dotenv';
dotenv.config(); // 👈 MUST be first

import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// Debug - check if bucket is loaded
console.log('AWS_S3_BUCKET in aws.js:', process.env.AWS_S3_BUCKET);

if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set!');
}

// Create S3 client (v3)
export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    followRegionRedirects: true,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Create multer-s3 storage with v3 client
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET, // Now this will have value
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const folder = file.mimetype.startsWith('image') ? 'images' :
                file.mimetype.startsWith('video') ? 'videos' : '3d-objects';
            cb(null, `content/${folder}/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024 }
});

export const uploadContent = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'objects', maxCount: 5 }
]);

export const uploadSingle = upload.single('file');