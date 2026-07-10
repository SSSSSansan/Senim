import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"Senim" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Код подтверждения — Senim',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Ваш код для входа в Senim</h2>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p style="color: #888;">Код действителен 10 минут. Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>
      </div>
    `,
  });
}