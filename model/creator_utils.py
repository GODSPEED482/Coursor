from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from langchain.schema.runnable import RunnableLambda
from utils import get_description, add_prop














# =====================================================
#                    HELPER CLASSES
# =====================================================
class VideoResource(BaseModel):
    """Represents a YouTube video linked to a skill."""
    type: Literal["video"] = "video"  # Discriminator field
    title: str = Field(..., description="Title of the video")
    url: str = Field(..., description="YouTube video URL")
    channel_name: str = Field(default="", description="Name of the YouTube channel")
    duration_minutes: int = Field(default=0, description="Length of the video in minutes")
    difficulty: str = Field(
        default="Beginner",
        description="Beginner / Intermediate / Advanced"
    )

class Pointer(BaseModel):
    """A data structure to store pointers for bullet points."""
    head: str = Field(..., description="Heading of the point, what the point is all about. It should be precise and within 5-6 words.")
    body: str = Field(..., description="Detailed explanation of the pointer. Must be in relation to and justify the head.")

class Bullet(BaseModel):
    """A content element to represent a list of pointers"""
    type: Literal["bullet"] = "bullet"  # Discriminator field
    title: str = Field(..., description="Title of the bullet list")
    pointers: List[Pointer] = Field(default_factory=list, description="the set of pointers composing the bullet list stored in order.")

class TableRow(BaseModel):
    """Represent the row of a Table data structure"""
    values: List[str] = Field(
        default_factory=list, description="Row values aligned with column order"
    )

class Table(BaseModel):
    """
    Represents a structured table content element consisting of
    a single header row and multiple body rows.
    """
    type: Literal["table"] = "table"  # Discriminator field
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
    body: List[TableRow] = Field(
        default_factory=list,
        description=(
            "List of data rows forming the body of the table. "
            "Each row must contain values that align index-wise with the header, "
            "preserving the column order defined by the header."
        )
    )

class Para(BaseModel):
    """Defines a paragraph bearing some info"""
    content_type: Literal["bullet", "table", "video"] = Field(
        ..., 
        description="Type of content: 'bullet' for bullet lists, 'table' for tables, 'video' for video resources"
    )
    
    # Separate fields instead of Union
    bullet: Bullet | None = Field(default=None, description="Bullet list content (only if content_type='bullet')")
    table: Table | None = Field(default=None, description="Table content (only if content_type='table')")
    video: VideoResource | None = Field(default=None, description="Video resource (only if content_type='video')")    


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

# Paragraph =(Annotated[(Bullet | Table | VideoResource) , Field(... , discriminator="type")])



























# =====================================================
#                    PROMPTS
# =====================================================

content_injector_prompt = ChatPromptTemplate.from_messages([
    (
       "system",
       """
# ROLE:
You are generating educational content in JSON format.

INPUT: A Skill object with name and details filled, but null introduction, body, and conclusion.

OUTPUT: A complete Skill object as valid JSON with:
- introduction: string
- body: array of Bullet/Table/VideoResource objects  
- conclusion: string

RULES:
- Output valid pydantic class: Skill
- Use double quotes
- No markdown formatting
- No explanatory text

#INPUT FORMAT (CRITICAL):
- Skill: {skill_description}


# CREATOR-ONLY ATTRIBUTES:
- introduction
- body
- conclusion


# INTRODUCTION
- Purpose: orient and motivate the learner
- Tone: explanatory, confident, learner-centric
- Length: concise but complete
- Must answer:
  • What is this skill?
  • Why does it matter?
  • What will the learner gain?

  Do NOT:
- Use bullet points
- Reference schema or system behavior
- Include implementation-level details

# BODY
The body represents the core instructional material.
Paragraph types:
- VideoResource: {vid_description}

- Table: {table_description}
    - TableRow: {table_row_description}

- Bullet: {bullet_description}
    - Pointer: {pointer_description}

You may ONLY use the following Paragraph types:
- Bullet
- Table
- VideoResource

General rules:
- Order content from conceptual → structured → reinforcement
- Ensure logical flow between consecutive paragraphs
- Prefer clarity over exhaustiveness

Bullet usage:
- Use to explain concepts, principles, mechanisms, or steps
- Each pointer must:
  • Have a concise head (≤ 6 words)
  • Have a body that clearly justifies the head
- Avoid redundancy between pointers

Table usage:
- Use when comparison, classification, or structured contrast improves clarity
- Headers define meaning; rows must strictly align index-wise
- Do not embed explanations outside table cells

VideoResource usage:
- Use sparingly (1-2 max)
- Must be directly relevant to the skill
- Difficulty should align with conceptual depth of the skill


# CONCLUSION
- Purpose: closure and reinforcement
- Summarize key takeaways without repeating verbatim content
- May include:
  • Common pitfalls
  • Conceptual intuition
  • Suggested next learning direction


Do NOT:
- Introduce new concepts
- Reference tables or bullets explicitly
- Add calls to action unrelated to learning

# REASONING CONSTRAINTS:
Internally reason about:
- Pedagogical flow
- Learner cognitive load
- Concept dependency

  
All creator-owned attributes MUST be populated.
All non-creator attributes MUST remain unchanged.

Produce ONLY the completed SKILL object.

        """  
    ),
    (
        "human",
        """
        Here is the empty skill object:
        - {input}
        Inject some content into it.
        """
    )
])




# =====================================================
#                      RUNNABLES
# =====================================================

get_creator_context = (
    RunnableLambda(lambda x: add_prop(x , "vid_description" , str(get_description(VideoResource)) ))
    | (lambda x: add_prop(x , "bullet_description" , str(get_description(Bullet))))
    | (lambda x: add_prop(x , "pointer_description" , str(get_description(Pointer)) ))
    | (lambda x: add_prop(x , "table_description" , str(get_description(Table)) ))
    | (lambda x: add_prop(x , "table_row_description" , str(get_description(TableRow)) ))
)