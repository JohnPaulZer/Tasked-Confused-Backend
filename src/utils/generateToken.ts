import { Response } from 'express';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '15d', // Token lasts for 15 days
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
    httpOnly: true, // Prevent XSS attacks (JS cannot access this cookie)
    sameSite: 'strict', // CSRF protection
    secure: process.env.NODE_ENV !== 'development', // HTTPS only in production
  });
};

export default generateTokenAndSetCookie;