import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../config/aws.js'; 
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.js';

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else if (file.mimetype.startsWith('video')) {
        cb(null, true);
    } else if (file.mimetype === 'application/octet-stream' && file.originalname.endsWith('.glb')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image, video, or 3D object! Please upload only images, videos, or GLB files.', 400), false);
    }
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_S3_BUCKET,
        acl: 'public-read',
        key: function (req, file, cb) {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const folder = file.mimetype.startsWith('image') ? 'images' :
                file.mimetype.startsWith('video') ? 'videos' : '3d-objects';
            cb(null, `content/${folder}/${fileName}`);
        },
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        }
    }),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

export const uploadContent = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'objects', maxCount: 5 }
]);

export const uploadSingle = upload.single('file');