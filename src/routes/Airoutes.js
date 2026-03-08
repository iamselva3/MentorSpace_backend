import express from 'express';
import { askAI } from '../controllers/Aicontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.use(protect);

router.post('/ask', askAI);

export default router;