import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";

// Verify JWT token and authenticate user before accessing protected routes
const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract JWT from HTTP-only cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    // Verify token signature and check expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Extract userId from token payload
    const userId = decoded.userId;

    // Verify user still exists in database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    // Attach userId to request object for access in route handlers
    (req as any).userId = userId;

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default protectRoute;
