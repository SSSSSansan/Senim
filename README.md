# Senim — Психологическая поддержка студентов KBTU

> **Senim** — веб-платформа психологической поддержки студентов KBTU на базе ИИ.

🔗 **Демо:** https://esg.kbtu.kz/senim 
🔗 **Репозиторий:** https://github.com/SSSSSansan/Senim

---

## О проекте

Студент заходит на сайт, входит по KBTU email (без пароля — код на почту) и получает доступ к AI-боту, который:

- Выслушивает и поддерживает в трудной ситуации
- Анализирует эмоциональное состояние по тексту сообщений
- Предлагает конкретные рекомендации после разговора
- Реагирует на быстрые сценарии (стресс, экзамены, выгорание и др.)
- При кризисных сигналах — показывает баннер экстренной помощи и создаёт обращение, видимое психологу/куратору

> ⚠️ Senim — не замена профессиональному психологу. При кризисе обратитесь к специалисту или позвоните на телефон доверия **150**.

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| LLM | Grok (xAI) — бесплатный тариф |
| База данных | PostgreSQL (Neon) |
| Авторизация | Email OTP + JWT |
| Email (OTP) | Gmail SMTP через Nodemailer |
| Деплой | Docker + Nginx, инфраструктура KBTU (`esg.kbtu.kz/senim`) |

---

## Команда

| Участник | Роль |
|---|---|
| Айгерим | Frontend — React, UI/UX, компоненты, роутинг, деплой |
| Сания | Backend — Express, БД, авторизация, LLM-интеграция |

---

## Запуск локально

### Требования

- Node.js 18+
- Docker + Docker Compose (рекомендуется — так конфигурация 1-в-1 повторяет прод)
- PostgreSQL база данных (или подключение к Neon)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/SSSSSansan/Senim.git
cd Senim
```

### 2. Настроить переменные окружения

```bash
cp .env.example backend/.env
```

Заполнить `backend/.env`:

```env
DATABASE_URL=your_postgres_connection_string
GROK_API_KEY=your_grok_api_key
JWT_SECRET=your_jwt_secret
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
ALLOWED_EMAIL_DOMAIN=kbtu.kz
PORT=3001
```

### 3а. Запуск через Docker (рекомендуется)

```bash
docker compose up --build
```

Сайт будет доступен на `http://localhost:5173/senim/` (с префиксом `/senim/`, как в проде).

### 3б. Запуск без Docker (для быстрой разработки)

**Backend:**
```bash
cd backend
npm install
npm run dev
```
Backend запустится на `http://localhost:3001`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend запустится на `http://localhost:5173`

---

## Основные функции

- 🔐 **Вход по KBTU email** — одноразовый код, без пароля
- 💬 **AI-чат** — эмпатичный диалог на русском и казахском
- 😊 **Анализ эмоций** — эмодзи-маркер состояния после каждого ответа
- 📋 **История диалогов** — хранится в БД, доступна с любого устройства
- ⚡ **Быстрые сценарии** — стресс, экзамены, выгорание, грусть, бессонница
- 💡 **Рекомендации** — персональные советы после разговора
- 🚨 **Экстренная помощь** — двойная детекция кризиса (LLM + rule-based), создание обращения в БД
- 👩‍⚕️ **Дашборд персонала** — психолог/куратор видит обращения студентов в группе риска

---

## Архитектура

Подробнее — в [ARCHITECTURE.md](./ARCHITECTURE.md)