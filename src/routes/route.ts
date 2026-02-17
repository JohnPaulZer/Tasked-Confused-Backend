import express from 'express';
import { signup, checkEmail, login, logout, updateProfile } from '../controller/auth';
import protectRoute from '../middlewares/protectTask'; // You provided this in protectTask.ts
import { forgotPassword, verifyOtp, resetPassword } from "../controller/auth";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/logout', logout);
router.put('/profile', protectRoute, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;