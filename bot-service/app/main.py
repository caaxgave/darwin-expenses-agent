import os
import logging
import warnings
import colorlog
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from agent import process_message_with_llm
from schemas import MessageRequest
from database import save_expense

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

# Configure colorlog
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(asctime)s - %(levelname)s - %(message)s',
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'red,bg_white',
    }
))
logging.basicConfig(level=logging.INFO, handlers=[logging.FileHandler('logs/main.log'), handler])
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Darwin Expenses Agent",
    description="LLM-powered expense extraction service",
    version="1.0.0"
)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/process")
async def process_message(request: MessageRequest):
    """
    Receives a raw message from the Node.js service,
    processes it through the LLM, and returns the structured expense data.
    """
    logger.info(f"Received message: {request.message}")
    try:
        # Step 1: Extract expense with LLM
        result = process_message_with_llm(request.message)
        logger.info(f"Processed result: {result}")

        # Step 2: Save to DB only if it's an actual expense
        if result.is_expense:
            await save_expense(
                user_id=request.user_id,       # needs to be added to MessageRequest
                description=result.description,
                amount=result.amount,
                category=result.category
            )

        return result
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting Darwin Expenses Agent on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)