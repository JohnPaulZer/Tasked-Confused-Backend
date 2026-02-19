import { sendOtpEmail } from "@/utils/sendEmail";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user";
import generateTokenAndSetCookie from "../utils/generateToken";

// Register a new user with email and password
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
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

// Authenticate user with credentials and create session
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
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
 * Clear user session by removing JWT cookie
 */
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Check if email exists in database
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

// Update user profile and password
export const updateProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.name = req.body.username || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({
            message: "Please provide current password",
          });
        }
        const isMatch = await bcrypt.compare(
          req.body.currentPassword,
          user.password,
        );
        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid current password",
          });
        }
        user.password = await bcrypt.hash(req.body.newPassword, 12);
      }
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

// Generate OTP and send to user email for password recovery
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();
    await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp: otp,
    });
    console.log(`📧 OTP sent to ${user.email}: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

// Verify OTP and clear it to prevent reuse
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Hash new password after OTP verification
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
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};
