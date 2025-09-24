import express from 'express';
import { handleGooglePostLogin, login, signup, verifyEmail } from '../controllers/authController.js';

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login)
router.post('/google', handleGooglePostLogin);
router.get('/verify-email/:token', verifyEmail);


export default router;