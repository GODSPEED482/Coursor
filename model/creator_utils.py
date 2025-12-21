from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from datetime import timedelta
from typing import Dict, Optional, List, Any
from utils import get_description,print_dict



# =====================================================
#                    HELPER CLASSES
# =====================================================

class VideoResource(BaseModel):
    """Represents a YouTube video linked to a skill."""
    title: str = Field(..., description="Title of the video")
    url: str = Field(..., description="YouTube video URL")
    channel_name: Optional[str] = Field(None, description="Name of the YouTube channel")
    duration_minutes: Optional[int] = Field(None, description="Length of the video in minutes")
    difficulty: Optional[str] = Field(
        None,
        description="Beginner / Intermediate / Advanced"
    )

class Pointer(BaseModel):
    """A data structure to store pointers for bullet points."""
    head: str=Field(..., description="Heading of the point, what the point is all about. It should be precise and within 5-6 words.")
    body: str=Field(..., description="Detailed explanation of the pointer. Must be in relation to and justify the head.")

class Bullet(BaseModel):
    """A content element to represent a list of pointers"""
    title: str = Field(... , description="Title of the bullet list")
    pointers: List[Pointer | Any] = Field(default_factory=list, description="the set of pointers composing the bullet list stored in order.")

class TableRow(BaseModel):
    """Represent the row of a Table data structure"""
    values: List[Any] = Field(
        ..., description="Row values aligned with column order"
    )

class Table(BaseModel):
    """
    Represents a structured table content element consisting of
    a single header row and multiple body rows.

    The table is order-sensitive:
    - The header defines the column labels and their sequence.
    - Each row in the body must align index-wise with the header.
    """

    title: str = Field(
        ...,
        description="Human-readable title describing the purpose or context of the table."
    )

    header: TableRow = Field(
        ...,
        description=(
            "Header row defining the column labels and their positional order. "
            "The number and order of header values determine the expected "
            "structure for all rows in the table body."
        )
    )

    body: list[TableRow] = Field(
        ...,
        description=(
            "List of data rows forming the body of the table. "
            "Each row must contain values that align index-wise with the header, "
            "preserving the column order defined by the header."
        )
    )    

Paragraph = VideoResource | Table | Bullet

class Question(BaseModel):
    """Base model for assessment questions."""
    question_text: str = Field(..., description="The question statement")
    options: List[str] = Field(..., description="List of options")
    correct_answers: List[int] = Field(
        ...,
        description="Indices of correct options (length=1 → MCQ, >1 → MSQ)"
    )
    explanation: Optional[str] = Field(
        None, description="Explanation for the correct answer(s)"
    )

class Quiz(BaseModel):
    """Quiz for a topic (MCQ/MSQ mix)."""
    title: str = Field(..., description="Quiz title")
    questions: List[Question] = Field(
        ..., description="List of MCQ/MSQ questions"
    )







