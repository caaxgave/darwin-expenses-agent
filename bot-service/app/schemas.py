from pydantic import BaseModel, Field
from typing import Optional


# Output schema definition for the expense extraction task.
class ExpenseExtraction(BaseModel):
    is_expense: bool = Field(
        description="True if the message is reporting an expense, False if it is a greeting, casual chat, or irrelevant."
    )
    description: Optional[str] = Field(
        default=None,
        description="A short description of the item or service purchased.",
    )
    amount: Optional[str] = Field(
        default=None, description="The monetary amount of the expense."
    )
    category: Optional[str] = Field(
        default=None,
        description="Only onw of the categories of the expense: "
        "Housing, Transportation, Food, Utilities, Insurance, Medical/Healthcare, Savings, Debt, Education, Entertainment, or Other",
    )


# Request schema
class MessageRequest(BaseModel):
    user_id: int
    message: str
