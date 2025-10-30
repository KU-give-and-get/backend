import express from 'express';
import { editProfile, getUser, handleGooglePostLogin, login, signUp, verifyEmail, sendResetPasswordLink, resetPassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router()

router.post('/signup', signUp);
router.post('/login', login)
router.post('/google', handleGooglePostLogin);
router.get('/verify-email/:token', verifyEmail);
router.put('/edit-profile', verifyToken, upload.single("profileImage"), editProfile);
router.get('/me', verifyToken, getUser);
router.post('/send-reset-password-link', sendResetPasswordLink);
router.post('/reset-password', resetPassword);



export default router;