import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Ваш код для входа в Senim",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Senim</h2>
        <p>Ваш код для входа:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>Код действителен 10 минут. Если вы не запрашивали вход — проигнорируйте это письмо.</p>
      </div>
    `,
  });
}