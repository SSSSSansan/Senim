# ARCHITECTURE.md — Senim

## Что такое Senim

**Senim** (каз. "сенім" — доверие) — веб-платформа психологической поддержки студентов KBTU на базе ИИ. Студент входит по KBTU email, общается с AI-ботом, получает эмоциональную поддержку и рекомендации. При кризисных сигналах создаётся обращение, видимое психологу/куратору через защищённый дашборд.

---

## Технический стек

| Слой | Технология |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| LLM | Grok (xAI) — бесплатный тариф |
| Risk-классификатор | Rule-based TypeScript, словари ключевых слов RU/KZ/EN |
| База данных | PostgreSQL (Neon, free tier) |
| Авторизация студента | Email OTP (KBTU-домен) + JWT |
| Авторизация персонала | JWT + bcrypt, роли psychologist / admin |
| Email (OTP) | Gmail SMTP через Nodemailer |
| Контейнеризация | Docker + docker-compose |
| Веб-сервер / прокси | Nginx (раздача SPA-статики + reverse-proxy на /api/) |
| Деплой | Инфраструктура KBTU — `esg.kbtu.kz/senim` |

---

## Структура репозитория

```
senim/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginScreen.tsx         # Вход по KBTU email (OTP)
│   │   │   ├── ChatWindow.tsx          # Область сообщений
│   │   │   ├── MessageInput.tsx        # Поле ввода + отправка
│   │   │   ├── QuickScenarios.tsx      # Кнопки быстрых сценариев
│   │   │   ├── EmotionBadge.tsx        # Эмодзи эмоции рядом с сообщением
│   │   │   ├── RecommendationPanel.tsx # Карточка рекомендаций
│   │   │   ├── EmergencyBanner.tsx     # Баннер экстренной помощи
│   │   │   ├── Sidebar.tsx             # История диалогов
│   │   │   ├── StaffLogin.tsx          # Форма входа для персонала
│   │   │   └── StaffDashboard.tsx      # Дашборд психолога/администратора
│   │   ├── hooks/
│   │   │   ├── useAuth.ts              # Логин/логаут студента, JWT
│   │   │   ├── useChat.ts              # Отправка сообщений, состояние чата
│   │   │   ├── useHistory.ts           # История диалогов из БД
│   │   │   └── useStaffAuth.ts         # Авторизация персонала
│   │   ├── types/index.ts              # Типы: Message, Conversation, Emotion
│   │   ├── App.tsx                     # Роутинг: студент / персонал
│   │   └── main.tsx
│   ├── nginx.conf                      # Раздача SPA + прокси на backend под /senim/
│   ├── Dockerfile
│   └── vite.config.ts                  # base путь настраивается через VITE_BASE_PATH
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Express сервер
│   │   ├── db.ts                       # Подключение к PostgreSQL
│   │   ├── routes/
│   │   │   ├── auth.ts                 # /api/auth — OTP, JWT студента
│   │   │   ├── chat.ts                 # /api/chat — диалог с LLM
│   │   │   └── staff.ts                # /api/staff — дашборд персонала
│   │   ├── middleware/
│   │   │   ├── requireStudent.ts       # Проверка JWT студента
│   │   │   └── requireStaff.ts         # Проверка JWT персонала + роль
│   │   ├── services/
│   │   │   ├── riskClassifier.ts       # Rule-based классификатор риска
│   │   │   └── email.ts                # Отправка OTP-кода через Gmail/Nodemailer
│   │   └── prompts/system.ts           # System prompt для Grok
├── docker-compose.yml
├── ARCHITECTURE.md
├── README.md
└── .env.example
```

---

## Поток данных: вход студента

```
Студент вводит KBTU email (@kbtu.kz)
        ↓
POST /api/auth/request-code
  → проверка домена email
  → генерация 6-значного кода, запись в auth_codes (TTL 10 мин)
  → отправка кода на email через Gmail SMTP
        ↓
Студент вводит код
        ↓
POST /api/auth/verify-code
  → сверка кода и TTL
  → найти / создать студента в таблице students
  → выдать JWT (7 дней)
        ↓
Frontend сохраняет JWT, все дальнейшие запросы идут с этим токеном
```

---

## Поток данных: одно сообщение в чате

```
Студент пишет сообщение
        ↓
useChat hook → POST /api/chat (Authorization: Bearer <JWT>)
        ↓
backend/routes/chat.ts
  → requireStudent: достаёт student_id из JWT
  → riskClassifier.ts: rule-based проверка (ключевые слова RU/KZ/EN, risk_score)
  → Grok API: system prompt + история → JSON-ответ
        ↓
JSON-ответ от LLM:
  {
    "reply": "текст ответа",
    "emotion": "joy | sadness | anxiety | anger | neutral",
    "isEmergency": false,
    "recommendations": null
  }
        ↓
Если isEmergency: true (LLM) ИЛИ risk_level critical/high (классификатор):
  → создать запись в таблице cases (student_id, risk_level, фрагмент диалога)
        ↓
Frontend получает ответ:
  → показывает reply в чате
  → обновляет EmotionBadge
  → если isEmergency → показывает EmergencyBanner
  → если recommendations → показывает RecommendationPanel
        ↓
Сообщение сохраняется в таблице messages (conversation_id, student_id)
```

---

## Схема базы данных

```sql
students      (id, email, full_name, created_at)
auth_codes    (id, email, code, expires_at, used)
conversations (id, student_id, title, created_at)
messages      (id, conversation_id, role, content, emotion, created_at)
cases         (id, student_id, risk_level, category, source_message, status, created_at)
staff_users   (id, username, hashed_password, role, is_active)
```

**cases.status:** `open` → `in_progress` → `resolved` (или `false_positive`)

**cases.risk_level:** `low` | `medium` | `high` | `critical`

**staff_users.role:** `psychologist` | `admin`

---

## Двойная система детекции кризиса

Кризис определяется двумя независимыми слоями:

**Слой 1 — LLM (Grok):**
Модель анализирует контекст всего разговора и возвращает `isEmergency: true`, если обнаруживает признаки суицидальных мыслей или самоповреждения.

**Слой 2 — Rule-based классификатор (riskClassifier.ts):**
Словари ключевых слов на русском, казахском и английском. Работает бесплатно, мгновенно, не зависит от LLM — подстраховывает на случай, если модель пропустит явный сигнал.

Если срабатывает хотя бы один слой — создаётся `case` в БД и показывается `EmergencyBanner`.

---

## Роутинг frontend

```
/                  → StudentApp (чат, если есть JWT студента)
/staff/login       → Форма входа для персонала
/staff/dashboard   → Дашборд (только с JWT персонала, иначе редирект на /staff/login)
```

Ссылка "Войти как сотрудник" находится внизу страницы логина студента.

---

## Почему отказались от анонимности

Изначально проект задумывался полностью анонимным (localStorage, без логина). Заказчик (куратор практики) попросил убрать анонимность: при кризисной ситуации психолог/преподаватель должен видеть, кто из студентов в таком состоянии, чтобы среагировать вовремя.

В результате:
- Студент входит по KBTU email (OTP, без пароля)
- История диалогов хранится в БД, привязана к студенту
- При кризисном сигнале создаётся case с привязкой к личности студента
- Персонал видит обращения через защищённый дашборд с JWT-авторизацией

---

## Деплой на esg.kbtu.kz/senim

У KBTU есть только общий домен `esg.kbtu.kz` — каждый проект размещается в своей подпапке, а не на отдельном поддомене. Из этого вытекает несколько особенностей конфигурации:

- **`vite.config.ts`** — `base` задаётся через переменную окружения `VITE_BASE_PATH` при сборке (`/senim/` в проде, `/` локально по умолчанию);
- **`App.tsx`** — `<BrowserRouter basename={import.meta.env.BASE_URL}>`, роутер сам подхватывает базовый путь;
- пути к статичным изображениям используют `${import.meta.env.BASE_URL}...` вместо абсолютных `/...`;
- **`docker-compose.yml`** — backend не публикует порт наружу (`expose`, а не `ports`), доступен только внутри Docker-сети;
- **`nginx.conf`** — раздаёт SPA-статику по `/senim/` и проксирует `/senim/api/` на `http://backend:3001/api/`.

Локальная проверка prod-конфигурации:
```bash
docker compose up --build
```
Открыть `http://localhost:5173/senim/`.

---

## Переменные окружения

```env
DATABASE_URL=          # PostgreSQL connection string (Neon)
GROK_API_KEY=           # Ключ Grok (xAI) API
JWT_SECRET=             # Секрет для подписи JWT
GMAIL_USER=             # Gmail-адрес для отправки OTP-писем
GMAIL_APP_PASSWORD=     # App Password Gmail (не обычный пароль аккаунта)
ALLOWED_EMAIL_DOMAIN=   # kbtu.kz
PORT=                   # 3001
```

---

*Последнее обновление: июль 2026*