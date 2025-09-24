import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createMessage, getMessagesByConversation } from '../controllers/messageController.js';

const router = express.Router();


router.get('/:conversationId', verifyToken, getMessagesByConversation);
router.post('/', verifyToken, createMessage)

export default router;
