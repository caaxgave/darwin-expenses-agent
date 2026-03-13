import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool using the Supabase URI
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Queries the database to see if the user's telegram_id exists in the users table.
 * @param {string} telegramId - The ID from the incoming Telegram message
 * @returns {boolean} - True if the user is whitelisted, False otherwise
 */
export async function isUserWhitelisted(telegramId) {
    try {
        const query = 'SELECT id FROM users WHERE telegram_id = $1';
        const values = [telegramId];
        
        const result = await pool.query(query, values);
        
        // If rowCount is greater than 0, the user exists in the database
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error checking user whitelist:', error);
        return false; 
    }
}