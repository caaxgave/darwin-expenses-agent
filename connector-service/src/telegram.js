import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Sends a plain text message to a Telegram chat.
 * @param {number} chatId - The Telegram chat ID
 * @param {string} text - The message text
 */
export async function sendMessage(chatId, text) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text,
        });
    } catch (error) {
        console.error(`❌ Error sending message to ${chatId}: ${error.message}`);
        throw error;
    }
}

/**
 * Sends a Markdown-formatted message to a Telegram chat.
 * @param {number} chatId - The Telegram chat ID
 * @param {string} text - The message text with Markdown formatting
 */
export async function sendMarkdownMessage(chatId, text) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
        });
    } catch (error) {
        console.error(`❌ Error sending markdown message to ${chatId}: ${error.message}`);
        throw error;
    }
}

/**
 * Sends a formatted expense confirmation message to a Telegram chat.
 * @param {number} chatId - The Telegram chat ID
 * @param {object} expense - The expense object from the Python service
 * @param {string} expense.description
 * @param {number} expense.amount
 * @param {string} expense.category
 */
export async function sendExpenseConfirmation(chatId, expense) {
    const text =
        `✅ *Expense recorded!*\n\n` +
        `📝 *Description:* ${expense.description}\n` +
        `💰 *Amount:* $${expense.amount}\n` +
        `🏷️ *Category:* ${expense.category}`;

    await sendMarkdownMessage(chatId, text);
}

/**
 * Sends a default welcome/fallback message when no expense is detected.
 * @param {number} chatId - The Telegram chat ID
 */
export async function sendFallbackMessage(chatId) {
    const text =
        `👋 Hey! Send me your expenses and I'll track them for you.\n\n` +
        `Example: _Pizza 20 bucks_`;

    await sendMarkdownMessage(chatId, text);
}

/**
 * Sends an error message to a Telegram chat.
 * @param {number} chatId - The Telegram chat ID
 */
export async function sendErrorMessage(chatId) {
    await sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
}