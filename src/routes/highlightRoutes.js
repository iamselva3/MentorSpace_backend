import express from 'express';
import {
    createHighlight,
    createBatchHighlights,
    updateHighlight,
    getStudentHighlights,
    getArticleHighlights,
    getHighlightStats,
    searchHighlights,
    exportHighlights,
    deleteHighlight
} from '../controllers/highlightController.js';
import { protect, isStudent } from '../middleware/auth.js';

const router = express.Router();


router.use(protect);
router.use(isStudent);

router.get('/stats', getHighlightStats);
router.get('/search', searchHighlights);
router.get('/export', exportHighlights);

router.post('/batch', createBatchHighlights);

router.get('/article/:articleId', getArticleHighlights);

router
    .route('/')
    .get(getStudentHighlights)
    .post(createHighlight);

router
    .route('/:id')
    .patch(updateHighlight)
    .delete(deleteHighlight);

export default router;