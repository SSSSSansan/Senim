import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthRequest extends Request {
  studentId?: number;
  studentEmail?: string;
}

export function requireStudent(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { studentId: number; email: string };
    req.studentId = decoded.studentId;
    req.studentEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Недействительный или истёкший токен" });
  }
}