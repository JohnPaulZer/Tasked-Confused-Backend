import express from "express";
import {
  checkEmail,
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
  verifyOtp,
} from "../controller/auth";
import protectRoute from "../middlewares/protectTask";

const router = express.Router();

router.post("/signup", signup); // Register new user
router.post("/login", login); // Authenticate user
router.post("/check-email", checkEmail); // Check if email exists
router.post("/logout", logout); // Clear session
router.put("/profile", protectRoute, updateProfile); // Update profile (Protected)
router.post("/forgot-password", forgotPassword); // Send OTP to email
router.post("/verify-otp", verifyOtp); // Verify OTP code
router.post("/reset-password", resetPassword); // Set new password

export default router;
