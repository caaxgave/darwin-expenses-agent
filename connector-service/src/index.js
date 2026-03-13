import express from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import axios from "axios";
import { sendExpenseConfirmation, sendFallbackMessage, sendErrorMessage } from "./telegram.js";
import { processMessage } from "./botClient.js";

dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN; // e.g. https://your-domain.com

if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set");
    process.exit(1);
}

// ── Express & Telegram setup ──────────────────────────────────────────────────
const app = express();
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

app.use(express.json());

// ── Bot logic ─────────────────────────────────────────────────────────────────
bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const message = ctx.message.text;

    console.log(`📩 Received message from user ${userId}: ${message}`);

    try {
        const result = await processMessage(userId, message); // ← use botClient

        if (result.is_expense) {
            await sendExpenseConfirmation(chatId, result);
        } else {
            await sendFallbackMessage(chatId);
        }
    } catch (error) {
        console.error(`❌ Error processing message: ${error.message}`);
        await sendErrorMessage(chatId);
    }
});

// ── Webhook endpoint ──────────────────────────────────────────────────────────
app.use(bot.webhookCallback("/webhook"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`🚀 Connector service running on port ${PORT}`);

    if (WEBHOOK_DOMAIN) {
        // Production: set webhook
        await bot.telegram.setWebhook(`${WEBHOOK_DOMAIN}/webhook`);
        console.log(`🔗 Webhook set to: ${WEBHOOK_DOMAIN}/webhook`);
    } else {
        // Development: use long polling
        await bot.telegram.deleteWebhook();
        bot.launch();
        console.log("🔄 Using long polling (development mode)");
    }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));