import os
import logging
import asyncpg
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Database connection ───────────────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")  # e.g. postgresql://user:pass@host:5432/dbname


async def get_connection() -> asyncpg.Connection:
    """Creates and returns a new database connection."""
    return await asyncpg.connect(DATABASE_URL)


# ── Database operations ───────────────────────────────────────────────────────


async def get_or_create_user(telegram_id: int) -> int:
    """
    Upserts a user by their Telegram ID into the users table.
    Returns the internal user id (int4 PK).
    """
    conn = await get_connection()
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO users (telegram_id)
            VALUES ($1)
            ON CONFLICT (telegram_id) DO UPDATE SET telegram_id = EXCLUDED.telegram_id
            RETURNING id
            """,
            str(telegram_id),  # ✅ Cast to text to match users.telegram_id column type
        )
        logger.info(
            f"Upserted user with telegram_id {telegram_id}, internal id: {row['id']}"
        )
        return row["id"]
    except Exception as e:
        logger.error(f"Error upserting user with telegram_id {telegram_id}: {e}")
        raise
    finally:
        await conn.close()


async def save_expense(
    user_id: int, description: str, amount: float, category: str
) -> dict:
    """
    Resolves the internal user id from the Telegram user id,
    then inserts a new expense record into the database.
    Returns the created expense as a dictionary.
    """
    conn = await get_connection()
    try:
        # ✅ Resolve internal user id from telegram_id before inserting
        internal_user_id = await get_or_create_user(user_id)

        row = await conn.fetchrow(
            """
            INSERT INTO expenses (user_id, description, amount, category, added_at)
            VALUES ($1, $2, $3::numeric, $4, $5)
            RETURNING id, user_id, description, amount::numeric, category, added_at
            """,
            internal_user_id,  # ✅ Use internal FK-safe id
            description,
            str(amount),  # ✅ cast float to str for asyncpg compatibility
            category,
            datetime.now(timezone.utc).replace(tzinfo=None),
        )
        logger.info(f"Saved expense: {description} - {amount} for user_id {user_id}")
        return dict(row)
    except Exception as e:
        logger.error(f"Error saving expense: {e}")
        raise
    finally:
        await conn.close()


async def get_expenses_by_user(user_id: int) -> list[dict]:
    """
    Retrieves all expenses for a given user ordered by date descending.
    """
    conn = await get_connection()
    try:
        # ✅ Resolve internal user id from telegram_id before querying
        internal_user_id = await get_or_create_user(user_id)

        rows = await conn.fetch(
            """
            SELECT id, user_id, description, amount::numeric, category, added_at
            FROM expenses
            WHERE user_id = $1
            ORDER BY added_at DESC
            """,
            internal_user_id,  # ✅ Use internal FK-safe id
        )
        logger.info(f"Retrieved {len(rows)} expenses for user_id {user_id}")
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error retrieving expenses for user_id {user_id}: {e}")
        raise
    finally:
        await conn.close()
