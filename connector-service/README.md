# 🔌 Darwin Expenses Bot — Connector Service

The **connector-service** is a Node.js/Express microservice that acts as the bridge between Telegram and the bot-service. It receives messages from Telegram users, forwards them to the Python bot-service for LLM processing, and sends the response back to the user.

---

## 🏗️ Architecture

```
Telegram User
     ↓
connector-service (Node.js)  ←  you are here
     ↓
bot-service (Python/FastAPI)
     ↓
Supabase (PostgreSQL)
```

---

## 📦 Tech Stack

- **Express** — REST API framework
- **Telegraf** — Telegram Bot SDK
- **Axios** — HTTP client for bot-service communication
- **dotenv** — Environment variable management

---

## ⚙️ Prerequisites

- Node.js 18+
- npm
- A Telegram Bot Token (get one from [@BotFather](https://t.me/BotFather))
- The **bot-service** running at `http://localhost:8000`

---

## 🤖 Creating a Telegram Bot

**1.** Open Telegram and search for [@BotFather](https://t.me/BotFather)

**2.** Send the command:
```
/newbot
```

**3.** Follow the prompts — choose a name and username for your bot

**4.** Copy the token BotFather gives you — you'll need it for the `.env` file

---

## 🚀 How to Run

**1. Install dependencies:**
```bash
cd connector-service
npm install
```

**2. Create a `.env` file inside `connector-service/`:**
```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PYTHON_SERVICE_URL=http://localhost:8000
WEBHOOK_DOMAIN=        # Leave empty for local development
PORT=3000
```

**3. Make sure the bot-service is running:**
```bash
# In a separate terminal
cd bot-service/app
python main.py
```

**4. Start the connector-service:**
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The service will be running at `http://localhost:3000` 🟢

> In development mode (no `WEBHOOK_DOMAIN` set), the bot uses **long polling** automatically — no public URL needed.

---

## 🧪 How to Test

### Health Check
```http
GET http://localhost:3000/health
```

### Expected Response
```json
{ "status": "ok" }
```

### Test the bot
Open Telegram, find your bot by its username, and send a message:

| Message | Expected Response |
|---|---|
| `Pizza 20 bucks` | ✅ Expense recorded with details |
| `Uber 15 dollars` | ✅ Expense recorded with details |
| `Hey, how are you?` | 👋 Fallback welcome message |

---

## 📁 Project Structure

```
connector-service/
├── src/
│   ├── index.js         # Express + Telegraf entry point
│   ├── telegram.js      # Telegram API helper functions
│   └── botClient.js     # HTTP client for bot-service
├── package.json
└── .env                 # Environment variables (not committed)
```

---

## 🌐 Production Deployment (Webhook)

For production, set `WEBHOOK_DOMAIN` in your `.env` to your public URL:
```bash
WEBHOOK_DOMAIN=https://your-domain.com
```

The service will automatically register the webhook with Telegram at:
```
https://your-domain.com/webhook
```