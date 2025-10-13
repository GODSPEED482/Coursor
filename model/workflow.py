import json
from dotenv import load_dotenv
load_dotenv()
from langchain.schema.runnable import RunnableParallel, RunnableLambda
from context import analyzer_prompt, CourseDetails, UserDetails, clarifier_prompt, Questions, get_unspecified_properties
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    thinking_budget=1024
)



res=llm.invoke("What is todays date?")
print(res.content)


course_context_llm = llm.with_structured_output(
    CourseDetails
)
user_context_llm = llm.with_structured_output(
    UserDetails
)
clarify_llm = llm.with_structured_output(
    Questions
)

analyzer_chain = (
    analyzer_prompt 
    | course_context_llm 
    | RunnableLambda(get_unspecified_properties)
    | (lambda x: {"props": str(x)} )
    | clarifier_prompt
    | clarify_llm
)

user_input = "Build me a course on Operating Systems."

response = analyzer_chain.invoke({
   "text": user_input,
   "aspect": "course"
   })

for question in response.question_set: #type: ignore
    print(str(question))