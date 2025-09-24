import express from 'express';
import { editProfile, getUser, handleGooglePostLogin, login, signup, verifyEmail } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login)
router.post('/google', handleGooglePostLogin);
router.get('/verify-email/:token', verifyEmail);
router.put('/edit-profile', verifyToken, upload.single("profileImage"), editProfile);
router.get('/me', verifyToken, getUser);


export default router;