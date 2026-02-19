import { Response } from "express";
import jwt from "jsonwebtoken";

// Generate JWT token and set as HTTP-only cookie
const generateTokenAndSetCookie = (
  userId: string,
  res: Response,
  rememberMe: boolean = false,
) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: rememberMe ? "30d" : "1d",
  });

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  res.cookie("jwt", token, {
    maxAge: maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  });
};

export default generateTokenAndSetCookie;
