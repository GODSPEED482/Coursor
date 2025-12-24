from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.schema.runnable import RunnableLambda
from interrogator_utils import CourseDetails
from typing import Optional, List
from creator_utils import Para, Quiz
from utils import *









# =====================================================
#                    HELPER CLASSES
# =====================================================


class Skill(BaseModel):
    """Represents the smallest unit — a specific concept or skill."""
    name: str = Field(..., description= "Name of the skill")
    details: Optional[str] = Field(..., description="Extra description or examples") 
    introduction: str | None = Field(
    ...,
    description=(
        "Opening narrative that introduces the context, motivation, "
        "and learning objectives of the content. It sets expectations."
        "and provides a high-level overview before the detailed body begins."
        "!!ONLY FILL THIS SECTION IF YOU ARE A CREATOR AGENT. IF YOU ARE A PLANNER AGENT YOU MUST ASSIGN NONE TO IT."
    )
    )
    body: List[Para] | None = Field(
        default_factory=list,
        description=("Main content of the body"
        "!!ONLY FILL THIS SECTION IF YOU ARE A CREATOR AGENT. IF YOU ARE A PLANNER AGENT ASSIGN NONE TO IT.")
    )
    conclusion: str | None = Field(
    ...,
    description=(
        "Closing narrative that summarizes key takeaways, reinforces "
        "core concepts, and provides closure to the discussion. "
        "May include final insights, recommendations, or next steps."
        "!!ONLY FILL THIS SECTION IF YOU ARE A CREATOR AGENT. IF YOU ARE A PLANNER AGENT YOU MUST ASSIGN NONE TO IT."
    ))

class Schedule(BaseModel):
    """Divides the entire curriculum Duration into two parts:
        - For learning the prerequisites.
        - For learning the main subject of the course
    """
    prerequisite_duration: int = Field(..., description="Number of Days the user must focus on learning the prerequisite of the course.")
    course_duration: int = Field(..., description="Number of days the user must focus on learning the main-curriculum. This constitutes a significant portion of the entire course Duration")


class Topic(BaseModel):
    """Represents a grouped topic like 'Programming Language' or 'Algorithms'."""
    title: str = Field(..., description="Title of the topic")
    skills: List[Skill] = Field(..., description="List of Skills the topic comprises of")
    quiz: Quiz | None = Field(... , 
                       description=(
                           "a final quiz that pops up after completion of each topic. questions from the quiz must be within/ related to the scope of given skills."
                           "!!ONLY FILL THIS SECTION IF YOU ARE A CREATOR AGENT. IF YOU ARE A PLANNER AGENT ASSIGN NONE TO IT.")
                       )


class Section(BaseModel):
    """Represents a major section like 'Programming Fundamentals'."""
    title: str = Field(..., description="Title of the section")
    description: Optional[str] = Field(..., description="defines what the section is all about")
    day_no: int = Field(..., description="The daywise sequential ordering of the Section. his number need not be unique to every constituent section of a curriculum. Just represent by what day of curriculum initiation this section requires completion.")
    topics: List[Topic] = Field(..., description="List of the topics relevant to the section")


class Curriculum(BaseModel):
    """Top-level model to represent the entire structured list."""
    name: str = Field(..., description="Title of the Curriculum")
    days: int = Field(..., description="Total days to complete the curriculum.")
    sections: List[Section] = Field(..., description="List of Sections relevant to the curriculum")



















# =====================================================
#                    PROMPTS
# =====================================================


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



prerequisite_planner_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
# INSTRUCTIONS:
- You are serving as the sub-agent for a system that helps build courses as per query.
- "Each sub-agent has a specific task. They must not go beyond the task they are assigned to."
- Your task is as follows:

TASK — Prerequisite Planner:
- !YOU ARE A PLANNER AGENT.
1) Read COURSE_DETAILS. The COURSE DETAILS is provided to you in a following structure:
   {course_description}
2) Infer the prerequisite knowledge/skills required to succeed in the course.
3) Classify prerequisites into clear buckets (e.g., Programming Fundamentals, Data Structures & Algorithms, OS/Systems Basics, Math/Logic, Tooling/Workflow).
4) Here is the description of the output structure you are generating:
   - CURRICULUM:- {curriculum_description}
   - SECTION:- {section_description}
   - TOPIC:- {topic_description}
   - SKILL:- {skill_description}
5) Identify gaps for the target audience and propose a compact bridging plan that fits the timeline until the deadline.
6) The curriculum must be planned such that it is feasible for the user to complete it within the specified days.
7) !!!There are certain attributes in the TOPIC and SKILL that are only to be filled by CREATOR agent. You are a PLANNER agent. So you should assign them "None" type always.
"""
    ),
    (
        "human",
        """
- COURSE_DETAILS:
  title: {title}
  objectives: {objectives}
  target_audience: {target_audience}
  difficultyLevel: {difficultyLevel}
  duration: {prerequisite_duration}
  
"""
    )
])



course_subject_planner_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
    """
# ROLE:
You are a curriculum-structuring sub-agent inside a course-building system.

# STRICT INSTRUCTIONS (NON-NEGOTIABLE):
- !YOU ARE A PLANNER AGENT.
- You must ONLY perform the task assigned to you.
- DO NOT explain your reasoning.
- DO NOT provide advice, commentary, or summaries.
- DO NOT add or remove fields from the output schema.
- DO NOT hallucinate information outside COURSE_DETAILS.
- !!!There are certain attributes in the TOPIC and SKILL that are only to be filled by CREATOR agent. You are a PLANNER agent. So you should assign them "None" type always.

# INPUT YOU WILL RECEIVE:
You will receive COURSE_DETAILS in the following structure:
{course_description}

# YOUR TASK:
Using COURSE_DETAILS, generate a structured learning plan with the following hierarchy:

# OUTPUT STRUCTURE (MANDATORY):
    - CURRICULUM: {curriculum_description}
    - SECTION: {section_description}
    - TOPIC: {topic_description}
    - SKILL: {skill_description}

# CONSTRAINTS:
- Difficulty must match COURSE_DETAILS.difficultyLevel
- Depth must match COURSE_DETAILS.target_audience
- Total curriculum duration must equal COURSE_DETAILS.duration
- Sections should be ordered progressively from fundamentals to advanced concepts
- Every Topic MUST have at least one Skill
- Every Section MUST have at least one Topic
- Every Section MUST represent a single day only. However there is NO NEED of mentioning the DAY_NO in the Section.title. Only mention it in the day no.

    """
    ),
    (
        "human" ,
    """
- COURSE_DETAILS:
  title: {title}
  objectives: {objectives}
  target_audience: {target_audience}
  difficultyLevel: {difficultyLevel}
  duration: {course_duration}
    """
    )
])

















# =====================================================
#                    FUNCTIONS
# =====================================================
def print_curriculum(curriculum):
    """Nicely print the Curriculum data structure with indentation and bullets."""

    def indent(text, level):
        """Helper to indent text by level."""
        return "    " * level + text

    print(f"\n📘 Curriculum: {curriculum.name}\n" + "=" * (14 + len(curriculum.name)))
    print(f"\n Total days: {curriculum.days}\n" + "=" * (14 + len(curriculum.name)))

    for section_index, section in enumerate(curriculum.sections, start=1):
        print(f"\nDay {section.day_no} - {section_index}. {section.title}")
        if section.description:
            print(indent(f"→ {section.description}", 1))

        for topic_index, topic in enumerate(section.topics, start=1):
            print(indent(f"{section_index}.{topic_index}) {topic.title}", 1))

            for skill in topic.skills:
                bullet = "•"
                skill_line = f"{bullet} {skill.name}"
                print(indent(skill_line, 2))
                if skill.details:
                    print(indent(f"  ↳ {skill.details}", 3))

    print("\n✅ End of Curriculum\n")

def add_curriculum(self: Curriculum, other: Curriculum) -> Curriculum:
    temp = [add_days(section, self.days) for section in other.sections]
    return Curriculum(name=self.name,
                      days=self.days + other.days,
                      sections=self.sections + temp)

def add_days(self: Section, day: int) -> Section:
    return Section(title=self.title,
                   description=self.description,
                   day_no=self.day_no + day,
                   topics=self.topics)














# =====================================================
#                      RUNNABLES
# =====================================================

get_planner_context = (
    RunnableLambda(lambda x: add_prop(x , "course_description" , str(get_description(CourseDetails)) ))
    | (lambda x: add_prop(x , "curriculum_description" , str(get_description(Curriculum)) ))
    | (lambda x: add_prop(x , "section_description" , str(get_description(Section)) ))
    | (lambda x: add_prop(x , "topic_description" , str(get_description(Topic)) ))
    | (lambda x: add_prop(x , "skill_description" , str(get_description(Skill)) ))
    | (lambda x: add_prop(x , "curriculum_duration" , x["prerequisite_duration"] ))
)






















# =====================================================
#                 TEST AND DEBUG
# =====================================================
    
course_details= {
    "title": "Operating Systems",
    "objectives": ['Prepare for upcoming Semester Exams'],
    "target_audience": ['3rd Year 1st Semester BTech IT student'],
    "difficultyLevel": 7,
    "deadline": "3rd December",
    "today_date": "2025-11-6"
}
# response = time_divider_chain.invoke(course_details)

# print(get_description(Skill))