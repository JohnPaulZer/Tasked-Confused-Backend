import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";

/**
 * PROTECT ROUTE MIDDLEWARE
 * Verifies JWT token and authenticates user before accessing protected routes
 *
 * @param {Request} req - Express request object containing JWT cookie
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Function to proceed to next middleware/route handler
 *
 * @process
 * 1. Extract JWT token from HTTP-only cookie
 * 2. Verify token signature and expiration
 * 3. Decode token to get userId
 * 4. Verify user still exists in database
 * 5. Attach userId to request object for downstream handlers
 * 6. Proceed to next handler or return 401 on failure
 *
 * @throws 401 Unauthorized if:
 *   - No token provided
 *   - Token is invalid or expired
 *   - User not found in database
 *
 * Usage: Apply this middleware to any route requiring authentication
 * Example: router.get('/api/protected', protectRoute, controller)
 */
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
