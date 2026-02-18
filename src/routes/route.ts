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

/**
 * AUTHENTICATION ROUTES
 * All routes for user registration, login, profile management, and password recovery
 * Base path: /api/auth
 */
const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user account
 * Body: { name, email, password }
 * Returns: { message, signup: { name } }
 */
router.post("/signup", signup);

/**
 * POST /api/auth/login
 * Authenticate user and create session
 * Body: { email, password, rememberMe }
 * Returns: { message, user: { _id, name, email, gender, mobile, address } }
 */
router.post("/login", login);

/**
 * POST /api/auth/check-email
 * Verify if email already exists (for signup validation)
 * Body: { email }
 * Returns: { exists: boolean }
 */
router.post("/check-email", checkEmail);

/**
 * POST /api/auth/logout
 * Clear user session and destroy JWT cookie
 * Returns: { message: "Logged out successfully" }
 */
router.post("/logout", logout);

/**
 * PUT /api/auth/profile
 * Update user profile information and password
 * Requires: Valid JWT token (protectRoute middleware)
 * Body: { username?, email?, mobile?, gender?, address?, currentPassword?, newPassword? }
 * Returns: { message, user: updated user data }
 * Security: Password change requires current password verification
 */
router.put("/profile", protectRoute, updateProfile);

/**
 * POST /api/auth/forgot-password
 * Initiate password reset by sending OTP to email
 * Body: { email }
 * Returns: { message: "OTP sent successfully" }
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /api/auth/verify-otp
 * Verify OTP received during password reset
 * Body: { email, otp }
 * Returns: { message: "OTP verified successfully" }
 */
router.post("/verify-otp", verifyOtp);

/**
 * POST /api/auth/reset-password
 * Set new password after OTP verification
 * Body: { email, newPassword }
 * Returns: { message: "Password reset successfully" }
 */
router.post("/reset-password", resetPassword);

export default router;
