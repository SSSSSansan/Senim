import { Router, Response } from "express";
import dotenv from "dotenv";
import { pool } from "../db";
import { requireStudent, AuthRequest } from "../middleware/requireStudent";
import { SYSTEM_PROMPT } from "../prompts/system";
import { classifyRisk } from "../services/riskClassifier";

dotenv.config();

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface LlmResponse {
  reply: string;
  emotion: "joy" | "sadness" | "anxiety" | "anger" | "neutral";
  isEmergency: boolean;
  recommendations: string[] | null;
}

router.post("/", requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, message } = req.body;
    const studentId = req.studentId;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Сообщение обязательно" });
    }

    // Классифицируем риск ДО отправки в LLM
    const risk = classifyRisk(message);

    let convId = conversationId;

    if (!convId) {
      const title = message.slice(0, 30);
      const convResult = await pool.query(
        "INSERT INTO conversations (student_id, title) VALUES ($1, $2) RETURNING id",
        [studentId, title]
      );
      convId = convResult.rows[0].id;
    }

    await pool.query(
      "INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)",
      [convId, "user", message]
    );

    const historyResult = await pool.query(
      "SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY id ASC",
      [convId]
    );

    const historyMessages = historyResult.rows.map((row) => ({
      role: row.role === "user" ? "user" : "assistant",
      content: row.content,
    }));

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...historyMessages],
        temperature: 0.7,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return res.status(502).json({ error: "AI-сервис временно недоступен" });
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content || "";

    let parsed: LlmResponse;
    try {
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse LLM response:", rawContent);
      return res.status(502).json({ error: "Ошибка обработки ответа AI" });
    }

    await pool.query(
      "INSERT INTO messages (conversation_id, role, content, emotion) VALUES ($1, $2, $3, $4)",
      [convId, "assistant", parsed.reply, parsed.emotion]
    );

    // Создаём case если риск critical/high от классификатора ИЛИ LLM сказал isEmergency
    const isEmergency = parsed.isEmergency || risk.level === "critical" || risk.level === "high";

    if (isEmergency) {
      await pool.query(
        `INSERT INTO cases (student_id, risk_level, category, source_message, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          studentId,
          risk.level !== "none" ? risk.level : "critical",
          risk.category || "llm_detected",
          message,
          "open",
        ]
      );
    }

    res.json({
      conversationId: convId,
      reply: parsed.reply,
      emotion: parsed.emotion,
      isEmergency,
      recommendations: parsed.recommendations,
      risk: {
        level: risk.level,
        category: risk.category,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось обработать сообщение" });
  }
});

export default router;