import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// ── Bot service client ────────────────────────────────────────────────────────

/**
 * Forwards a user message to the Python bot-service for LLM processing.
 * @param {number} userId - The Telegram user ID
 * @param {string} message - The raw message text from Telegram
 * @returns {Promise<object>} - The structured expense extraction result
 */
export async function processMessage(userId, message) {
    try {
        const response = await axios.post(`${PYTHON_SERVICE_URL}/process`, {
            user_id: userId,
            message: message,
        });
        console.log(`✅ Python service processed message for user ${userId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error calling Python service: ${error.message}`);
        throw error;
    }
}

/**
 * Checks if the Python bot-service is healthy and reachable.
 * @returns {Promise<boolean>} - True if the service is up, false otherwise
 */
export async function checkHealth() {
    try {
        const response = await axios.get(`${PYTHON_SERVICE_URL}/health`);
        return response.data.status === "ok";
    } catch (error) {
        console.error(`❌ Python service is unreachable: ${error.message}`);
        return false;
    }
}