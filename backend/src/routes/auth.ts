import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db";
import { sendOtpEmail } from "../services/email";

dotenv.config();

const router = Router();

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "kbtu.kz";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/request-code
router.post("/request-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email обязателен" });
    }

    const domain = email.split("@")[1];
    if (domain !== ALLOWED_DOMAIN) {
      return res.status(400).json({ error: `Используйте почту домена @${ALLOWED_DOMAIN}` });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await pool.query(
      "INSERT INTO auth_codes (email, code, expires_at, used) VALUES ($1, $2, $3, false)",
      [email, code, expiresAt]
    );

    await sendOtpEmail(email, code);

    res.json({ message: "Код отправлен на почту" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось отправить код" });
  }
});

// POST /api/auth/verify-code
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email и код обязательны" });
    }

    const result = await pool.query(
      `SELECT * FROM auth_codes 
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Неверный или истёкший код" });
    }

    const authCode = result.rows[0];

    await pool.query("UPDATE auth_codes SET used = true WHERE id = $1", [authCode.id]);

    let studentResult = await pool.query("SELECT * FROM students WHERE email = $1", [email]);

    let student;
    if (studentResult.rows.length === 0) {
      const insertResult = await pool.query(
        "INSERT INTO students (email) VALUES ($1) RETURNING *",
        [email]
      );
      student = insertResult.rows[0];
    } else {
      student = studentResult.rows[0];
    }

    const token = jwt.sign(
      { studentId: student.id, email: student.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, student: { id: student.id, email: student.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось проверить код" });
  }
});

export default router;