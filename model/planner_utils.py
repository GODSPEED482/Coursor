from dotenv import load_dotenv
load_dotenv()
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI


class Duration(BaseModel):
    years: Optional[int] =Field(..., description="no. of years it takes to complete the assigned module")
    months: Optional[int] =Field(..., description="no. of months it takes to complete the assigned module")
    weeks: Optional[int] =Field(..., description="no. of weeks it takes to complete the assigned module")
    days: Optional[int] =Field(..., description="no. of days it takes to complete the assigned module")
    
class Schedule(BaseModel):
    """"""
    duration: Duration =Field(...,description="Describe the time needed to complete the course..")
    start_date: date=Field(... , description="The date when the assigned module shall commence.")
    end_date: date=Field(... , description="The date when the assigned module shall be completed.")

class Topic(BaseModel):
    """
    Represents a focused sub-section within a course module.
    Topics are arranged sequentially to form a modular learning structure,
    each contributing to a deeper and more comprehensive understanding
    of the overall course subject.
    """
    title: str = Field(..., description="The title or name of the topic.")
    content: str = Field(..., description="Detailed explanation or notes in Markdown format.")


class Module(BaseModel):
    """Describe a course module: A module can be defined as a self-contained unit or 
    section within a larger course."""
    title: str=Field(...,description="Name or title of the module.")
    content: list[Topic]=Field(..., description="All the topics relevant to the Module, arranged in a proper sequential manner.")
    

class CoursePlan(BaseModel):
    """This is a model that stores information regarding all the modules of the course and the time required to finish them."""
    title:  str=Field(...,description="Title of the course.")
    schedule:  Dict[Module , Schedule]=Field(... , description="Maps a module against a schedule that needs to be followed in order to finish the course.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)
course_plan_llm=llm.with_structured_output(CoursePlan)
