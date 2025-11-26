from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Optional, List

# user_input -> context_analyzer -> scope of study , prerequisite knowlege -> purpose analyzer -> courseplanner


# ======================================================================
#                          HELPER CLASSES
# ======================================================================

class CourseDetails(BaseModel):
    """Get insights regarding the course in a structured manner."""
    title: str = Field(... , description="A string defining the title of the course.")
    objectives: list[str] = Field(... , description="A list of strings; defines the purpose of the course")
    target_audience: list[str] = Field(... , description="A list of strings; define the scope of study necessary for undestanding this course (Graduate, Post-Graduate, etc.)")
    difficultyLevel: str = Field(... , description="A string defining difficulty of the course on a scale of 1 to 10")
    deadline: Optional[str] = Field(... , description="A string defining the deadline date of the course: The time by which the course needs to be finished by the user.")
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









# ======================================================================
#                              PROMPTS
# ======================================================================


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
        - !!Donot assume the value of any property. In case it's not mentioned assign the string "NOT SPECIFIED!!"
     '''
     ),
     ("human", 
      "{text}")
])

clarifier_prompt = ChatPromptTemplate.from_messages([
   (
      "system" ,
      """
         # INSTRUCTIONS

         You are a clarifying agent. Your task is to STRICTLY perform the following:
         - You will be given a set of unspecified properties
         - Analyze all the unspecified properties.
         - Generate a set of questions.
         - While asking questions subjectify the one directly talking to you. Try not to subjectify the course. In case , it has to be mentioned objectify the course.
            - ## EXAMPLE: 
               "What are the prerequisites for the course?"  ❌ Wrong
               "Are there any relevant/related topics you are already familiar with?" ✅ Correct
         - Assume that the course is built only for the one interacting with you. Generate questions that way.
         - !!MAKE SURE THAT YOU MAKE EXACTLY 1 QUESTION FOR EACH UNSPECIFIED PROPERTY.
         - !!DONOT ASSUME THE VALUES OF THOSE PROPERTIES ON YOUR OWN.
      """
   ),
   (
      "human",
      """
      Following is the set of all the unspecified properties: 
         {props}
      With the following being the context/description of those properties:
         {context}
      These are the properties that were not mentioned when asked about what course they wanted to create.
      Generate some questions relevant to clarify these properties.
      """
   )
])

context_modifier_prompt = ChatPromptTemplate.from_messages([
   (
      "system",
      """
      # INSTRUCTIONS
         - You are serving as the sub-agent for a system that helps build courses as per query.
         - !!"Each sub-agent has specific task. They must not go beyond the task they are assigned to. Hence the same goes for you."
         - Your task is mentioned as follows:
            - You will be provided following resources by the human:
               - COURSE_DETAILS: A stringified python object defining information obtained regarding the course to be built. Go through the docs of the object mentioned below to understand the significance of each and every property:
                  {description}
               
               - UNSPECIFIED_PROPERTY: A property that wasn't previously specified by the user , but regarding which a question was recently asked to the user (by some other sub-agent) for clarification.

               - USER_RESPONSE: How user responded to the clarification question.

               
            - You need to analyze the USER_RESPONSE, pick up some points relevant to the UNSPECIFIED_PROPERTY, then generate a new COURSE_DETAILS object, with the value of the UNSPECIFIED_PROPERTY updated accordingly.
         
      """
   ),
   (
      "human",
      """
         - COURSE_DETAILS: {course_details}
         - UNSPECIFIED_PROPERTY: {unspecified_property}
         - USER_RESPONSE: {user_response}
         Generate an updated COURSE_DETAILS object accordingly.
      
      """
   )
])









# ======================================
#               FUNCTIONS
# ======================================

def get_unspecified_properties(details_object: CourseDetails):
   unspecified_properties = []
   for property, value in details_object.__dict__.items():
      if str(value).__contains__("NOT SPECIFIED"):
         unspecified_properties.append(property)
   return unspecified_properties