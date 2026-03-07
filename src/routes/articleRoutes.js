import express from 'express';
import {
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle,
    getRecentArticles
} from '../controllers/articleController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadContent } from '../middleware/upload.js';

const router = express.Router();


router.get('/', protect, getArticles);

router.post('/', protect, restrictTo('teacher'), uploadContent, createArticle);
router.get('/recent-articles', protect, getRecentArticles);

router.get('/:id', protect, getArticle);

router.patch('/:id', protect, restrictTo('teacher'), uploadContent, updateArticle);


router.delete('/:id', protect, restrictTo('teacher'), deleteArticle);


export default router;