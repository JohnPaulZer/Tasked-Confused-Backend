import { sendOtpEmail } from "@/utils/sendEmail";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user";
import generateTokenAndSetCookie from "../utils/generateToken";

// ============================================================================
// AUTHENTICATION CONTROLLER
// Handles user registration, login, logout, and password management
// ============================================================================

/**
 * SIGNUP - Register a new user
 * POST /api/auth/signup
 * Creates a new user account with email and password
 * @param {Request} req - Request with { name, email, password } in body
 * @param {Response} res - Response with new user data and JWT token
 * @throws {Error} If user already exists or hashing fails
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password with salt rounds = 12 for enhanced security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token and set it as HTTP-only cookie
    generateTokenAndSetCookie(newUser._id.toString(), res);

    res.status(201).json({
      message: "User created successfully",
      signup: {
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Error in signup", error });
  }
};

// LOGIN
/**
 * LOGIN - Authenticate user and create session
 * POST /api/auth/login
 * Verifies credentials and returns user data with JWT token
 * @param {Request} req - Request with { email, password, rememberMe } in body
 * @param {Response} res - Response with user data and JWT token
 * @returns {Object} User object with _id, name, email, gender, mobile, address
 * @throws {Error} If credentials are invalid
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Compare provided password with hashed password
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token (expiry depends on rememberMe flag)
    generateTokenAndSetCookie(user._id.toString(), res, rememberMe);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        mobile: user.mobile,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error in login", error });
  }
};

/**
 * LOGOUT - Destroy user session
 * POST /api/auth/logout
 * Clears the JWT cookie to end the session
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const logout = (req: Request, res: Response) => {
  // Clear JWT cookie by setting expiry to past date
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * CHECK EMAIL - Verify if email exists
 * POST /api/auth/check-email
 * Used during signup to prevent duplicate account creation
 * @param {Request} req - Request with { email } in body
 * @param {Response} res - Response with boolean exists flag
 * @returns {Object} { exists: boolean }
 */
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

/**
 * UPDATE PROFILE - Modify user account details
 * PUT /api/auth/profile
 * Allows user to update personal information and password
 * @param {Request} req - Request with userId from middleware and updated data in body
 * @param {Response} res - Response with updated user data
 * @security Requires valid JWT token (protectRoute middleware)
 * @throws {Error} If current password is incorrect during password change
 */
export const updateProfile = async (req: any, res: Response) => {
  try {
    // userId is added by protectRoute middleware from JWT token
    const user = await User.findById(req.userId);

    if (user) {
      // 1. Update basic profile fields
      user.name = req.body.username || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;

      // 2. Update password (with verification of current password)
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({
            message: "Please provide current password",
          });
        }

        // Verify current password matches stored hash
        const isMatch = await bcrypt.compare(
          req.body.currentPassword,
          user.password,
        );
        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid current password",
          });
        }

        // Hash and update password
        user.password = await bcrypt.hash(req.body.newPassword, 12);
      }

      // 3. Save updated user to MongoDB
      const updatedUser = await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          gender: updatedUser.gender,
          address: updatedUser.address,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

/**
 * FORGOT PASSWORD - Initiate password reset
 * POST /api/auth/forgot-password
 * Generates OTP and sends it to user's email for verification
 * @param {Request} req - Request with { email } in body
 * @param {Response} res - Response with success message
 * @throws {Error} If user not found
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set OTP expiry (15 minutes)
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Save OTP and expiry to user document
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // 4. Send OTP via email
    await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp: otp,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

/**
 * VERIFY OTP - Validate OTP received by user
 * POST /api/auth/verify-otp
 * Checks if OTP is valid and not expired before allowing password reset
 * @param {Request} req - Request with { email, otp } in body
 * @param {Response} res - Response with success message
 * @throws {Error} If OTP is invalid or expired
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user with matching email and valid OTP
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() }, // Check OTP not expired
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Clear OTP immediately to prevent reuse
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

/**
 * RESET PASSWORD - Update password with new value
 * POST /api/auth/reset-password
 * Changes user's password after OTP verification
 * @param {Request} req - Request with { email, newPassword } in body
 * @param {Response} res - Response with success message
 * @throws {Error} If user not found
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash new password with salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP-related fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};
