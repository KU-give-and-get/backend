import express from 'express';
import { getUser, handleGooglePostLogin, login, signup } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login)
router.post('/google', handleGooglePostLogin);

router.get('/me', verifyToken, getUser);


export default router;