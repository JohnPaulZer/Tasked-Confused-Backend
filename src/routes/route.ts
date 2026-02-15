// src/routes/auth.route.ts
import express from 'express';
import { signup, Login,checkEmail } from '../controller/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', Login);
router.post('/check-email', checkEmail);

export default router;