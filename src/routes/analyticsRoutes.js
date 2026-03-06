import express from 'express';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/teacher', getTeacherAnalytics);
router.get('/student', getStudentAnalytics);

export default router;