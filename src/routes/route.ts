// src/routes/auth.route.ts
import express from 'express';
import { signup, checkEmail, login } from '../controller/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;