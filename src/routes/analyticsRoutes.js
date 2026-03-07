import express from 'express';
import { getTeacherAnalytics, getStudentAnalytics, getCategoryStats, getStudentProgress } from '../controllers/analyticsController.js';
import { isStudent, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/teacher', getTeacherAnalytics);
router.get('/student', getStudentAnalytics);
router.get('/categories', getCategoryStats);
router.get('/student-progress/:articleId', getStudentProgress);

export default router;