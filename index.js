import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();


console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Not found');
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET ? '✅ Found' : '❌ Not found');


import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/database.js';

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});


connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`🚀 App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!   Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});