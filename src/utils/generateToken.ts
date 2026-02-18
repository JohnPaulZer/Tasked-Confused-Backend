import { Response } from "express";
import jwt from "jsonwebtoken";

/**
 * GENERATE TOKEN AND SET COOKIE
 * Creates a JWT token and sets it as an HTTP-only cookie
 *
 * @param {string} userId - The MongoDB user ID to encode in the token
 * @param {Response} res - Express response object to set the cookie on
 * @param {boolean} rememberMe - If true, extends token validity to 30 days; otherwise 1 day
 *
 * @process
 * 1. Creates JWT token with userId payload
 * 2. Sets token expiration based on rememberMe flag
 * 3. Sets secure HTTP-only cookie with CSRF protection
 *
 * Security Features:
 * - httpOnly: Prevents JavaScript access (XSS protection)
 * - secure: HTTPS only in production
 * - sameSite: CSRF protection via SameSite policy
 */
const generateTokenAndSetCookie = (
  userId: string,
  res: Response,
  rememberMe: boolean = false,
) => {
  // Create JWT token with expiration
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: rememberMe ? "30d" : "1d", // Extended expiry if remember-me is enabled
  });

  // Calculate cookie max age (in milliseconds)
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 1 day

  // Set secure HTTP-only cookie
  res.cookie("jwt", token, {
    maxAge: maxAge,
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV !== "development", // HTTPS in production
    sameSite: "strict", // CSRF protection
  });
};

export default generateTokenAndSetCookie;
