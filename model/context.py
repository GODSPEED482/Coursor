from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Optional

# user_input -> context_analyzer -> scope of study , prerequisite knowlege -> purpose analyzer -> courseplanner

class UserDetails(BaseModel):
   """Get Insights regarding the user in a structures format."""
   model_config = {
        "arbitrary_types_allowed": True
    }
   name: str = Field(... , description="name of the user.")
   proffession: str = Field(... , description="current job role of the user.")
   career_experience: Optional[list[str]] =  Field(... , description="experience of the user in the corporate world.")
   academic_experience: Optional[list[str]] = Field(... , description="academic background of the user.")

class CourseDetails(BaseModel):
    """Get insights regarding the course in a structured manner."""
    title: str = Field(... , description="Title of the course.")
    description: str = Field(... , description="Defines the purpose of the course")
    difficultyLevel: str = Field(... , description="difficulty of the course on a scale of 1 to 10")
    deadline: Optional[str] = Field(... , description="Deadline of the course")
    prerequisites: Optional[list[str]] = Field(... , description="must-have knowledge for understanding this course..")
    model_config = {
        "arbitrary_types_allowed": True
    }

class Question(BaseModel):
   """Question to be asked for clarification of context"""
   unspecified_property: str = Field(... , description="the property unpecified and requires some resolution")
   clarification_question: str = Field(... , description="the question that was asked in order to clarify the result of the unspecified_property.")

class Questions(BaseModel):
   """Provide a set of questions needed to be asked to the user in a structured manner, for a clear context"""
   question_set: list[Question] = Field(... , description="the set of questions required to make the context clear.")
   

# TODO: SYSTEM PROMPT

# CONTEXT ANALYZER

analyzer_prompt = ChatPromptTemplate.from_messages([
    ("system" , 
     '''

     # INSTUCTIONS
     - You are a part of the helpful assistant, that helps users in creating a reliable roadmap for a course. 
     - Your task is to STRICTLY analyze the message sent by human and get insights regarding the course and user. Nothing else. Not even roadmap generation.

     Rules:
        - Always return **valid JSON**.
        - Keep property names descriptive.
        - Nest objects when needed.
        - Avoid unnecessary repetition.
        - Generate whatever points You think are relevant for building a successful roadmap for the course. 
        - If a particular property is relevant for building the roadmap, But the human didn't mention anything related to that property, create that property regardless.
        - !!Donot assume the value of any property. In case it's not mention assign the string "NOT SPECIFIED!!"

     '''
     ),
     ("human", 
      "{text}")
])

def get_unspecified_properties(details_object: CourseDetails | UserDetails):
   unspecified_properties = []
   for property, value in details_object.__dict__.items():
      if str(value).__contains__("NOT SPECIFIED"):
         unspecified_properties.append(property)
   return unspecified_properties

clarifier_prompt = ChatPromptTemplate.from_messages([
   (
      "system" ,
      """
         # INSTRUCTIONS

         You are a clarifying agent. Your task is to STRICTLY perform the following:
         - You will be given a set of unspecified properties
         - Analyze all the unspecified properties.
         - Generate a set of questions.
         - !!MAKE SURE THAT YOU MAKE EXACTLY 1 QUESTION FOR EACH UNSPECIFIED PROPERTY.
         - !!DONOT ASSUME THE VALUES OF THOSE PROPERTIES ON YOUR OWN.
      """
   ),
   (
      "human",
      """
      Following is the set of all the unspecified properties: 
         {props}
      Generate some questions relevant to clarify these properties.
      """
   )
])