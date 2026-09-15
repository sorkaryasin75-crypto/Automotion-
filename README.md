# Telegram Human Worker Automation Platform

A **production-ready, RAM-only, human-in-the-loop Telegram worker platform** built with Node.js and TypeScript, designed to be deployed directly from GitHub to Railway.

## ⚠️ Important Architectural Notice: NO DATABASE

This application uses **RAM-only state (In-Memory)** via TypeScript `Map`, `Set`, and typed objects. 
**No external or persistent databases** (PostgreSQL, MySQL, MongoDB, Redis, etc.) are used.

> **CRITICAL RESTART BEHAVIOR:**
> All local sessions, active worker tasks, runtime statistics, and rate limits disappear when Railway restarts or redeploys.

---

## Features
- **Telegram Bot Interface:** Fully interactive via Inline Keyboards and ForceReply input.
- **Human-in-the-Loop Only:** Strictly enforces manual human answering. No automated solvers, CAPTCHA bypasses, or anti-bot circumvention.
- **Official 2Captcha Integration:** Clean provider adapter interacting solely with documented API endpoints.
- **Multi-Worker Concurrency Support:** In-memory locking and session management allowing simultaneous workers without task collision.
- **Admin Controls:** Dedicated administrative menus for monitoring runtime metrics, active workers, and system status.
- **Production Ready:** Includes health endpoints (`/health`, `/ready`), secure webhook verification (`X-Telegram-Bot-Api-Secret-Token`), idempotency protection, rate limiting, and graceful shutdown (`SIGTERM`, `SIGINT`).

---

## Environment Variables

Configure these secrets in Railway or your local `.env` file:

```env
PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CAPTCHA_PROVIDER_API_KEY=your_2captcha_api_key
TELEGRAM_WEBHOOK_SECRET=your_secure_webhook_secret_string
ADMIN_TELEGRAM_IDS=111111111,222222222
LOG_LEVEL=info
MAX_WORKERS=100
TASK_TIMEOUT_SECONDS=120
MAX_RETRIES=3
CLEANUP_INTERVAL_MS=60000
