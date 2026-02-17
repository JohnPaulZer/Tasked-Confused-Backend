import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import generateTokenAndSetCookie from '../utils/generateToken';
import { sendEmail } from "../utils/mail";
import { sendOtpEmail } from '@/utils/sendEmail';

// --- SIGNUP ---
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });

    generateTokenAndSetCookie(newUser._id.toString(), res);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser // Return full user object
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Error in signup", error });
  }
};

// --- LOGIN ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    // Check password
    const isMatch = user && await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateTokenAndSetCookie(user._id.toString(), res);

    res.status(200).json({
      message: "Login successful",
      user: user // Return full user object so frontend has mobile/address immediately
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error in login", error });
  }
};

// --- LOGOUT ---
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
};

// --- CHECK EMAIL ---
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

// --- 👇 UPDATE PROFILE (NEW) ---
export const updateProfile = async (req: any, res: Response) => {
  try {
    // req.userId is added by the 'protectRoute' middleware
    const user = await User.findById(req.userId);

    if (user) {
      // 1. Update Basic Fields
      user.name = req.body.username || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;

      // 2. Update Password (Securely)
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
            return res.status(400).json({ message: "Please provide current password" });
        }
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
           return res.status(401).json({ message: 'Invalid current password' });
        }
        user.password = await bcrypt.hash(req.body.newPassword, 12);
      }

      // 3. Save to MongoDB
      const updatedUser = await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// 1. Forgot Password (Send OTP)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set expiry (e.g., 15 minutes from now)
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Save to User model
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // 4. CALL YOUR DESIGNED EMAIL FUNCTION 🚀
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

// 2. Verify OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() } // Check if expiry is in the future
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// 3. Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};