import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createConversation, getMyConversations } from '../controllers/convoController.js';

const router = express.Router();

router.post('/', verifyToken, createConversation);
 
router.get('/my', verifyToken, getMyConversations);

export default router;