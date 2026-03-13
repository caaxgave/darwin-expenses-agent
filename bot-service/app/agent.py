import os
import logging
import warnings
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from schemas import ExpenseExtraction
from prompts import SYSTEM_PROMPT

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

# ✅ Create logs directory before setting up file handler
os.makedirs("logs", exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("logs/agent.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()


def process_message_with_llm(message: str) -> ExpenseExtraction:
    """
    Takes a raw string from Telegram, processes it through the LLM,
    and returns a structured ExpenseExtraction object.
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=api_key)
        structured_llm = llm.with_structured_output(ExpenseExtraction)

        prompt = ChatPromptTemplate.from_messages(
            [("system", SYSTEM_PROMPT), ("human", "{user_input}")]
        )

        chain = prompt | structured_llm
        result = chain.invoke({"user_input": message})
        logger.info(f"Successfully processed message: {message}")
        return result

    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise
    except Exception as e:
        logger.error(f"Error processing message '{message}': {e}")
        raise


# Quick local test
if __name__ == "__main__":
    print(process_message_with_llm("Pizza 20 bucks"))
    print(process_message_with_llm("Hey bot, how are you?"))
    print(process_message_with_llm("Uber 40 dollars"))
    print(process_message_with_llm("I spend 23 grands on pliers and screwdrivers"))
    print(process_message_with_llm("paracetemol 5 usd"))
