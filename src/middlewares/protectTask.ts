import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';

const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.userId;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }   
    (req as any).userId = userId; // Attach user ID to request object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }     
};

export default protectRoute;