import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user'; // Ensure this path matches your file structure
import generateTokenAndSetCookie from '../utils/generateToken';

// --- SIGNUP ---
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the user
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    // 4. Generate Token & Set Cookie
    generateTokenAndSetCookie(newUser._id.toString(), res);

    // 5. Send Response
    res.status(201).json({
      message: 'User created successfully',
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email 
      }
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

    // 1. Find User
    const user = await User.findOne({ email });

    // 2. Check Password
    // We check if user exists AND if password matches in one line for security
    const isMatch = user && await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token & Set Cookie
    generateTokenAndSetCookie(user._id.toString(), res);

    // 4. Send Response
    res.status(200).json({
      message: "Login successful",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error in login", error });
  }
};

// --- LOGOUT ---
export const logout = (req: Request, res: Response) => {
  // Clear the cookie by setting it to empty and expiring immediately
  res.cookie("jwt", "", { 
    httpOnly: true,
    expires: new Date(0) 
  });
  
  res.status(200).json({ message: "Logged out successfully" });
};

// --- CHECK EMAIL ---
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Returns true if user exists, false if not
    res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error("Check Email Error:", error);
    res.status(500).json({ message: "Error checking email", error });
  }
};