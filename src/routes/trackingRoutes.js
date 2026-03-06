import express from 'express';
import { trackView, trackDuration } from '../controllers/trackingController.js';
import { protect, isStudent } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(isStudent);

router.post('/view/:articleId', trackView);
router.post('/duration/:articleId', trackDuration);

export default router;