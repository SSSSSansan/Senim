import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface StaffRequest extends Request {
  staffId?: number;
  staffRole?: string;
  params: any;
}

export function requireStaff(req: StaffRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Требуется авторизация персонала" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      staffId: number;
      role: string;
    };
    req.staffId = decoded.staffId;
    req.staffRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Недействительный или истёкший токен" });
  }
}

export function requireAdmin(req: StaffRequest, res: Response, next: NextFunction) {
  if (req.staffRole !== "admin") {
    return res.status(403).json({ error: "Доступ только для администратора" });
  }
  next();
}