import json
from dotenv import load_dotenv
load_dotenv()
from langchain.schema.runnable import RunnableParallel, RunnableLambda, RunnablePassthrough
from interrogator_utils import analyzer_prompt, CourseDetails, clarifier_prompt, Questions, get_unspecified_properties, Question, context_modifier_prompt
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)



# res=llm.invoke("What is todays date?")
# print(res.content)

# LLM

course_llm = llm.with_structured_output(
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
def modify(
        course_details: CourseDetails, 
        unspecified_property: str, 
        user_response: str
    ) -> CourseDetails:
        context_modifier_chain = context_modifier_prompt | course_llm
        return context_modifier_chain.invoke({
            "description": str(description),
            "course_details": str(course_details),
            "unspecified_property": unspecified_property,
            "user_response": user_response
        }) #type: ignore

def ask_questions(questions: list[Question], course_details: CourseDetails) -> CourseDetails:

    for question in questions:
        response = input(f"{question.clarification_question}\n")
        course_details = modify(
            course_details=course_details,
            unspecified_property=question.unspecified_property,
            user_response=response
        )
    
    return course_details

# Chains

course_analyzer_chain = analyzer_prompt | course_llm

clarifier_chain = (
    RunnableLambda(get_unspecified_properties)
    | (lambda x : {"props" : str(x), "context": str(description)})
    | clarifier_prompt 
    | question_llm
    | (lambda x: x.question_set)
)


# Workflows

course_details_workflow = (
    course_analyzer_chain 
    | RunnableParallel({
        "questions": clarifier_chain,
        "course_details": RunnablePassthrough()
    })
    | RunnableLambda((lambda x: ask_questions(x["questions"], x["course_details"])))#type: ignore
)




user_input = "Build me a course on Operating Systems."

response = course_details_workflow.invoke({
   "text": user_input,
   "aspect": "course"
   })

for key , value in response.__dict__.items():
    print(f"{key}: {value}")