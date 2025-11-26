import json
from dotenv import load_dotenv
load_dotenv()
from langchain.schema.runnable import RunnableParallel, RunnableLambda, RunnablePassthrough, RunnableBranch
from interrogator_utils import *
from langchain_google_genai import ChatGoogleGenerativeAI
from planner_utils import *
from utils import *

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)

# LLM

course_details_llm = llm.with_structured_output(
    CourseDetails
)
question_llm = llm.with_structured_output(
    Questions
)




# ================================================
#                   Utilities
# ================================================

description = { 
    name : field.description
    for name, field in CourseDetails.model_fields.items()
}


def is_prerequisite_required(x) -> bool:
    return x.get("prerequisite_duration") != 0


def validate(response: str) -> bool: 
     res = llm.with_structured_output(Validate).invoke(f"today is {date.today()}. This is the deadline {response}. Return false if the deadline is before today's date. Also return false if the date is not a valid date.")
     return res.is_valid #type: ignore

# Example Usage: print(validate("21st August 2025"))

def modify(
        course_details: CourseDetails, 
        unspecified_property: str, 
        user_response: str
    ) -> CourseDetails:
        context_modifier_chain = context_modifier_prompt | course_details_llm
        return context_modifier_chain.invoke({
            "description": str(description),
            "course_details": str(course_details),
            "unspecified_property": unspecified_property,
            "user_response": user_response
        }) #type: ignore

def ask_questions(questions: list[Question], course_details: CourseDetails) -> CourseDetails:

    for question in questions:
        flag = 0
        if question.unspecified_property == "deadline" : flag = 1
        response = "hey"
        while 1:
            response = input(f"{question.clarification_question}\n")
            if flag and validate(response): flag = 0
            if flag == 0 : break
            print("Not a valid date or date has already passed away.")
        
        
        course_details = modify(
            course_details=course_details,
            unspecified_property=question.unspecified_property,
            user_response=response
        )
    
    return course_details






# ==============================================
#                    Chains
# ==============================================

course_analyzer_chain = analyzer_prompt | course_details_llm

clarifier_chain = (
    RunnableLambda(get_unspecified_properties)
    | (lambda x : {"props" : str(x), "context": str(description)})
    | clarifier_prompt 
    | question_llm
    | (lambda x: x.question_set)
)

prerequisite_planner_chain = prerequisite_planner_prompt| llm.with_structured_output(Curriculum)






# ==============================================
#                  Workflows
# ==============================================

course_details_workflow = (
    course_analyzer_chain 
    | RunnableParallel({
        "questions": clarifier_chain,
        "course_details": RunnablePassthrough()
    })
    |(lambda x: ask_questions(x["questions"], x["course_details"]))#type: ignore
    |(lambda x: x.__dict__)
    |(lambda x: add_today(x))
)

time_divider_workflow = (
     RunnableParallel({
          "course_details": RunnablePassthrough(),
          "course_duration": time_divider_chain | (lambda x: x.__dict__)
     })
     | (lambda x: flatten_dict(x))
     | (lambda x: del_prop(x , "today_date"))
     | (lambda x: del_prop(x , "deadline"))
)

prerequisite_planner_workflow = (
     RunnableLambda(lambda x: add_prop(x , "course_description" , str(get_description(CourseDetails)) ))
    | (lambda x: add_prop(x , "curriculum_description" , str(get_description(Curriculum)) ))
    | (lambda x: add_prop(x , "section_description" , str(get_description(Section)) ))
    | (lambda x: add_prop(x , "topic_description" , str(get_description(Topic)) ))
    | (lambda x: add_prop(x , "skill_description" , str(get_description(Skill)) ))
    | (lambda x: add_prop(x , "curriculum_duration" , x["prerequisite_duration"] ))
    | prerequisite_planner_chain
)







# ====================================
#             Test Run
# ====================================

user_input = "Build me a course on Operating Systems."

response = (time_divider_workflow | RunnableBranch((is_prerequisite_required, prerequisite_planner_workflow), RunnableLambda(lambda x: {"answer": "No prerequisite provided"}))).invoke(course_details)

# response = time_divider_workflow.invoke(course_details)

# print_dict(response)

# response = llm.invoke("Suppose there is a 3rd year B.Tech IT student trying to learn Operating Systems for his upcoming semester exams. When asked about how difficult he wants the course to be on a scale of 1 to 10 he has opted for 7. He wants to complete the course by 3rd December 2025 and today is 28th November 2025. How much time of his course_duration should he give to learning prerequisites before jumping to the main section??")

print_curriculum(response) if type(response) == Curriculum  else print_dict(response)
# print(response.content)