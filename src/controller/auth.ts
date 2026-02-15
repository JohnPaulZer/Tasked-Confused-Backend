import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
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

    // 4. Send response
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      }
    });

  } catch (error) {
    // Pass to your global error handler or send simple error
    next(error); 
  }
};

export const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }  

    const isMatch = await bcrypt.compare(password, user.password);

    // 2. Check password    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }



    // 3. Send response (you can add JWT token here later)
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
    } catch (error) {
    // Pass to your global error handler or send simple error
    next(error); 
  }
  
};
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Returns true if user exists, false if not
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};