import express from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { sendExpenseConfirmation, sendFallbackMessage, sendErrorMessage } from "./telegram.js";
import { processMessage } from "./botClient.js";

dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN; // e.g. https://your-domain.com

if (!TELEGRAM_BOT_TOKEN) {
    console.error("sTELEGRAM_BOT_TOKEN is not set");
    process.exit(1);
}

// ── Express & Telegram setup ──────────────────────────────────────────────────
const app = express();
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

app.use(bot.webhookCallback("/webhook"));

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// ── Bot logic ─────────────────────────────────────────────────────────────────
bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const message = ctx.message.text;

    console.log(`Received message from user ${userId}: ${message}`);

    try {
        const result = await processMessage(userId, message); // ← use botClient

        if (result.is_expense) {
            await sendExpenseConfirmation(chatId, result);
        } else {
            await sendFallbackMessage(chatId);
        }
    } catch (error) {
        console.error(`Error processing message: ${error.message}`);
        await sendErrorMessage(chatId);
    }
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`Connector service running on port ${PORT}`);
    console.log(`WEBHOOK_DOMAIN: ${WEBHOOK_DOMAIN}`);  // ✅ debug
    console.log(`TELEGRAM_BOT_TOKEN set: ${!!TELEGRAM_BOT_TOKEN}`);  // ✅ debug

    if (WEBHOOK_DOMAIN) {
        const webhookUrl = `https://${WEBHOOK_DOMAIN}/webhook`;
        console.log(`🔗 Setting webhook to: ${webhookUrl}`);  // ✅ debug
        await bot.telegram.setWebhook(webhookUrl);
        console.log(`Webhook set successfully`);
    } else {
        await bot.telegram.deleteWebhook();
        bot.launch();
        console.log("Using long polling (development mode)");
    }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));