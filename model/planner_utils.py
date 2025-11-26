from dotenv import load_dotenv
load_dotenv()
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from datetime import timedelta
from typing import Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from utils import *


class Schedule(BaseModel):
    """Divides the entire curriculum Duration into two parts:
        - For learning the prerequisites.
        - For learning the main subject of the course
    """
    prerequisite_duration: int = Field(..., description="Number of Days the user must focus on learning the prerequisite of the course.")

    course_duration: int = Field(..., description="Number of days the user must focus on learning the main-curriculum. This constitutes a significant portion of the entire course Duration")

time_divider_prompt = ChatPromptTemplate.from_messages([
    ("system", 
    """
    You are an assistant that divides the available learning time between prerequisites and the main curriculum.

        ## TASK:
        - Calculate how many days should be dedicated to learning the prerequisites vs. the main course.
        - The total duration should not exceed the number of days between `today_date` and `deadline`.
        - Allocate a significant amount of the course_duration to the curriculum
        - !!YOU MUST GENERATE OUTPUT IN DAYS ONLY. 
        - "0 days" can be allocated to the prerequisite, but do this only under extremely tight deadlines.
        - Return your result in JSON format with fields:
            - ** prerequisite_duration **: Number of Days the user must focus on learning the prerequisite of the course.
            - ** curriculum_duration **: Number of days the user must focus on learning the main-curriculum. This constitutes a significant portion of the entire course Duration

        - While generating output no need to mention "days" in literals as the terms itself define number of days only. For Example:
            - ❌ Wrong: "0 days", "1 day", "2 days"
            - ✅ Right: "0", "1", "2"
    """),
    ("human",
    """
    Here are the following resources that you require:
        - ** COURSE DEADLINE **: {deadline}
        - ** CURRENT DATE **: {today_date}
    """)
])

course_details= {
    "title": "Operating Systems",
    "objectives": ['Prepare for upcoming Semester Exams'],
    "target_audience": ['3rd Year 1st Semester BTech IT student'],
    "difficultyLevel": 7,
    "deadline": "3rd December",
    "today_date": "2025-11-3"
}

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)

schedule_llm = llm.with_structured_output(Schedule)
time_divider_chain = time_divider_prompt|schedule_llm
# response = time_divider_chain.invoke(course_details)

# print_dict(response.__dict__)

prerequisite_planner_prompt = "hey"
course_subject_planner_prompt = "hello"