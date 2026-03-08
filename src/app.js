import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import highlightRoutes from './routes/highlightRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import AiRoutes from './routes/Airoutes.js'
import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/errorController.js';



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/ai', AiRoutes)


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;