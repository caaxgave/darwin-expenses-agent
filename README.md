# 🤖 Darwin Expenses Bot

Darwin is a **Telegram bot** that helps you track your expenses effortlessly. Just send a message like _"Pizza 20 bucks"_ and Darwin will automatically extract the expense details and save them to your personal expense history.

---

## ✨ How It Works

1. Send a message to [@DarwinExpensesBot](https://t.me/DarwinExpensesBot) on Telegram
2. Darwin uses AI to understand your message and extract the expense
3. The expense is automatically saved to your account
4. Darwin replies with a confirmation of what was recorded

### Examples

| You say | Darwin records |
|---|---|
| `"Pizza 20 bucks"` | 🍕 Pizza — $20.00 — Food |
| `"Uber ride was 15 dollars"` | 🚗 Uber ride — $15.00 — Transportation |
| `"Paid rent 800"` | 🏠 Rent — $800.00 — Housing |
| `"Paracetamol 5 usd"` | 💊 Paracetamol — $5.00 — Medical/Healthcare |

### Expense Categories
Darwin automatically classifies your expenses into:
> Housing · Transportation · Food · Utilities · Insurance · Medical/Healthcare · Savings · Debt · Education · Entertainment · Other

---

## 🏗️ Architecture

```
Telegram User
     ↓  (sends message)
connector-service (Node.js/Express)
     ↓  (forwards message)
bot-service (Python/FastAPI)
     ↓  (extracts expense via LLM)
OpenAI GPT-4o-mini
     ↓  (saves to DB)
Supabase (PostgreSQL)
     ↓  (confirmation)
Telegram User
```

---

## 📦 Services

| Service | Tech | Description |
|---|---|---|
| [`connector-service`](connector-service/README.md) | Node.js · Express · Telegraf | Telegram webhook handler |
| [`bot-service`](bot-service/README.md) | Python · FastAPI · LangChain | LLM expense extraction + DB |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- Conda
- A Telegram account
- Supabase account at [supabase.com](https://supabase.com)
- OpenAI API key at [platform.openai.com](https://platform.openai.com)

### Run locally

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/darwin-expenses-agent.git
cd darwin-expenses-agent
```

**2. Set up and run the bot-service:**
```bash
cd bot-service
pip install -r requirements.txt
# Add your .env file (see bot-service/README.md)
cd app
python main.py
```

**3. Set up and run the connector-service:**
```bash
cd connector-service
npm install
# Add your .env file (see connector-service/README.md)
npm run dev
```

**4.** Open Telegram, find [@DarwinExpensesBot](https://t.me/DarwinExpensesBot) and start sending expenses! 🎉

> For detailed setup instructions for each service, see their individual READMEs:
> - 📄 [bot-service README](bot-service/README.md)
> - 📄 [connector-service README](connector-service/README.md)

---

## 🌐 Deployment

Both services are deployed on **Railway** and connected to each other automatically.

| Service | URL |
|---|---|
| connector-service | `https://darwin-connector-service.up.railway.app` |
| bot-service | `https://darwin-bot-service.up.railway.app` |

---

## 📁 Project Structure

```
darwin-expenses-agent/
├── bot-service/              # Python FastAPI service
│   ├── app/
│   │   ├── main.py           # API entry point
│   │   ├── agent.py          # LLM processing
│   │   ├── schemas.py        # Pydantic models
│   │   ├── prompts.py        # LLM system prompt
│   │   ├── database.py       # DB operations
│   │   └── request.http      # Test requests
│   ├── requirements.txt
│   └── README.md
├── connector-service/         # Node.js Express service
│   ├── src/
│   │   ├── index.js          # Entry point
│   │   ├── telegram.js       # Telegram helpers
│   │   └── botClient.js      # bot-service HTTP client
│   ├── package.json
│   └── README.md
└── README.md                  # You are here
```

---

## 🔒 Security

- Never commit your `.env` files
- Rotate credentials immediately if exposed
- Both `.env` files are listed in `.gitignore`