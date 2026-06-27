import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db";
import { requireStaff, StaffRequest } from "../middleware/requireStaff";

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// POST /api/staff/login — вход персонала
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username и пароль обязательны" });
    }

    const result = await pool.query(
      "SELECT * FROM staff_users WHERE username = $1 AND is_active = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный username или пароль" });
    }

    const staff = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, staff.hashed_password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Неверный username или пароль" });
    }

    const token = jwt.sign(
      { staffId: staff.id, role: staff.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      staff: { id: staff.id, username: staff.username, role: staff.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка входа" });
  }
});

// GET /api/staff/cases — список всех кейсов
router.get("/cases", requireStaff, async (req: StaffRequest, res: Response) => {
  try {
    const { risk_level, status } = req.query;

    let query = `
      SELECT 
        c.id,
        c.risk_level,
        c.category,
        c.source_message,
        c.status,
        c.created_at,
        s.email as student_email
      FROM cases c
      JOIN students s ON c.student_id = s.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (risk_level) {
      params.push(risk_level as string);
      query += ` AND c.risk_level = $${params.length}`;
    }

    if (status) {
      params.push(status as string);
      query += ` AND c.status = $${params.length}`;
    }

    query += " ORDER BY c.created_at DESC";

    const result = await pool.query(query, params);
    res.json({ cases: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось получить кейсы" });
  }
});

// GET /api/staff/cases/:id — детали кейса + фрагмент диалога
router.get("/cases/:id", requireStaff, async (req: StaffRequest, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);

    const caseResult = await pool.query(
      `SELECT c.*, s.email as student_email
       FROM cases c
       JOIN students s ON c.student_id = s.id
       WHERE c.id = $1`,
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: "Кейс не найден" });
    }

    const caseData = caseResult.rows[0];

    // Достаём последние 10 сообщений студента для контекста
    const messagesResult = await pool.query(
      `SELECT m.role, m.content, m.emotion, m.created_at
       FROM messages m
       JOIN conversations conv ON m.conversation_id = conv.id
       WHERE conv.student_id = $1
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [caseData.student_id]
    );

    res.json({
      case: caseData,
      recentMessages: messagesResult.rows.reverse(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось получить кейс" });
  }
});

// PATCH /api/staff/cases/:id/status — смена статуса кейса
router.patch("/cases/:id/status", requireStaff, async (req: StaffRequest, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const { status } = req.body;

    const allowed = ["open", "in_progress", "resolved", "false_positive"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Статус должен быть одним из: ${allowed.join(", ")}` });
    }

    const result = await pool.query(
      "UPDATE cases SET status = $1 WHERE id = $2 RETURNING *",
      [status, caseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Кейс не найден" });
    }

    res.json({ case: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось обновить статус" });
  }
});

export default router;