# 🤖 Darwin Expenses Bot — Bot Service

The **bot-service** is a Python FastAPI microservice that receives messages from the connector-service, processes them through an OpenAI LLM to extract expense data, and saves the results to a PostgreSQL (Supabase) database.

---

## 🏗️ Architecture

```
Telegram User
     ↓
connector-service (Node.js)
     ↓
bot-service (Python/FastAPI)  ←  you are here
     ↓
OpenAI GPT-4o-mini (LLM)
     ↓
Supabase (PostgreSQL)
```

---

## 📦 Tech Stack

- **FastAPI** — REST API framework
- **LangChain** — LLM orchestration
- **OpenAI GPT-4o-mini** — Expense extraction
- **asyncpg** — Async PostgreSQL client
- **Pydantic** — Data validation
- **Supabase** — PostgreSQL database

---

## ⚙️ Prerequisites

- Python 3.12+
- Conda
- Supabase account at [supabase.com](https://supabase.com)
- OpenAI API key at [platform.openai.com](https://platform.openai.com)

---

## 🗄️ Database Setup

**1. Create a new project** at [supabase.com](https://supabase.com) and grab your `DATABASE_URL` from:
> Project Settings → Database → Connection String → URI

**2. Open the SQL Editor** in your Supabase project and run the following queries in order:

**Create the users table:**
```sql
CREATE TABLE users (
    "id" SERIAL PRIMARY KEY,
    "telegram_id" text NOT NULL
);
```

**Add unique constraint to telegram_id:**
```sql
ALTER TABLE users ADD CONSTRAINT users_telegram_id_key UNIQUE (telegram_id);
```

**Create the expenses table:**
```sql
CREATE TABLE expenses (
    "id" SERIAL PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES users("id"),
    "description" text NOT NULL,
    "amount" numeric NOT NULL,
    "category" text NOT NULL,
    "added_at" timestamp NOT NULL
);
```

**Support large Telegram user IDs:**
```sql
ALTER TABLE expenses ALTER COLUMN user_id TYPE BIGINT;
```

---

## 🚀 How to Run

**1. Create and activate conda environment:**
```bash
conda create -n darwin-expenses-agent python=3.12
conda activate darwin-expenses-agent
```

**2. Install dependencies:**
```bash
cd bot-service
pip install -r requirements.txt
```

**3. Create a `.env` file inside `bot-service/app/`:**
```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**4. Create the logs directory:**
```bash
mkdir -p bot-service/logs
```

**5. Start the service:**
```bash
cd bot-service/app
python main.py
```

The service will be running at `http://localhost:8000` 🟢

---

## 🧪 How to Test

Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension, then open [`app/request.http`](app/request.http) and click **Send Request**.

### Health Check
```http
GET http://localhost:8000/health
```

### Expense message
```http
POST http://localhost:8000/process
Content-Type: application/json

{
    "user_id": "1",
    "message": "Pizza 20 bucks"
}
```

### Non-expense message
```http
POST http://localhost:8000/process
Content-Type: application/json

{
    "user_id": "1",
    "message": "Hey, how are you?"
}
```

### Expected Response
```json
{
  "is_expense": true,
  "description": "Pizza",
  "amount": "20",
  "category": "Food"
}
```

---

## 📁 Project Structure

```
bot-service/
├── app/
│   ├── main.py          # FastAPI entry point
│   ├── agent.py         # LLM processing logic
│   ├── schemas.py       # Pydantic models
│   ├── prompts.py       # LLM system prompt
│   ├── database.py      # Database operations
│   └── request.http     # Test requests
├── logs/
│   └── main.log         # Application logs
├── requirements.txt
└── .env                 # Environment variables (not committed)
```