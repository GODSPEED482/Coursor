import json
from dotenv import load_dotenv
load_dotenv()
from langchain.schema.runnable import RunnableParallel, RunnableLambda, RunnablePassthrough
from interrogator_utils import *
from langchain_google_genai import ChatGoogleGenerativeAI
from datetime import date

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)



# res=llm.invoke("What is todays date?")
# print(res.content)

# LLM

class Validate(BaseModel):
     is_valid: bool     

course_details_llm = llm.with_structured_output(
    CourseDetails
)
question_llm = llm.with_structured_output(
    Questions
)

# Utilities

description = { 
    name : field.description
    for name, field in CourseDetails.model_fields.items()
}


def add_today(x):
    x["today_date"] = date.today()
    return x

def validate(response: str) -> bool:
     res = llm.with_structured_output(Validate).invoke(f"today is {date.today()}. This is the deadline {response}. Return false if the deadline is before today's date. Also return false if the date is not a valid date.")
     return res.is_valid #type: ignore

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

# Chains

course_analyzer_chain = analyzer_prompt | course_details_llm

clarifier_chain = (
    RunnableLambda(get_unspecified_properties)
    | (lambda x : {"props" : str(x), "context": str(description)})
    | clarifier_prompt 
    | question_llm
    | (lambda x: x.question_set)
)

prerequisite_analyzer_chain = prerequisite_analyzer_prompt| llm.with_structured_output(Curriculum)


# Workflows

course_details_workflow = (
    course_analyzer_chain 
    | RunnableParallel({
        "questions": clarifier_chain,
        "course_details": RunnablePassthrough()
    })
    | RunnableLambda((lambda x: ask_questions(x["questions"], x["course_details"])))#type: ignore
    | (lambda x: x.__dict__)
    | (lambda x: add_today(x))
    | prerequisite_analyzer_chain
)




user_input = "Build me a course on Operating Systems."

response = course_details_workflow.invoke({
   "text": user_input,
   "aspect": "course"
   })

# response = llm.with_structured_output(Curriculum).invoke("Suppose You want to build a course on Operating System for 3rd year undergraduate students pursuing Bachelor in Engineering in Information Technology. What are the topics you would expect the user to have learnt already for the course? Provide a list of those topics.")

# for key, value in response.__dict__.items():
#      print(f"{key}: {value}")

# print(validate("21st August 2025"))

print_curriculum(response)