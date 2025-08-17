import express from 'express';
import { handleGooglePostLogin, login, signup } from '../controllers/authController.js';

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login)
router.post('/google', handleGooglePostLogin);


export default router;