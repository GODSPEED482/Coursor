from langchain.schema.runnable import RunnableParallel, RunnableLambda, RunnablePassthrough, RunnableBranch
from interrogator_utils import *
from planner_utils import *
from creator_utils import *
from utils import *



# LLM
llm = get_llm()

course_details_llm = llm.with_structured_output(
    CourseDetails
)
question_llm = llm.with_structured_output(
    Questions
)
content_llm = llm.with_structured_output(
     Skill
)

schedule_llm = llm.with_structured_output(Schedule)



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

def ask_questions(questions: list[Interrogation], course_details: CourseDetails) -> CourseDetails:

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
time_divider_chain = time_divider_prompt|schedule_llm

def log_X(x):
    print(type(x), x)
    return x

def is_empty(x: list) -> bool:
    return len(x) == 0

clarifier_chain = (
    RunnableLambda(get_unspecified_properties)
    | RunnableBranch(
         (
            is_empty,
            RunnableLambda(lambda x: [])
         ),
        RunnableLambda((lambda x : {"props" : str(x), "context": str(description)}))
        # | log_X
        | clarifier_prompt 
        | question_llm
        | (lambda x: x.question_set)
        # | log_X)
    )
)

prerequisite_planner_chain = prerequisite_planner_prompt| llm.with_structured_output(Curriculum)
content_injector_chain = content_injector_prompt | content_llm




def log_course_details(course_details: CourseDetails):
    print("Draft Course Details:")
    print(f"Title: {course_details.title}")
    print(f"Objectives: {course_details.objectives}")
    print(f"Target Audience: {course_details.target_audience}")
    print(f"Difficulty Level: {course_details.difficultyLevel}")
    print(f"Deadline: {course_details.deadline}")
    return course_details

# ==============================================
#                  Workflows
# ==============================================

course_details_workflow = (
    course_analyzer_chain 
    | RunnableParallel({
        "questions": clarifier_chain,
        "course_details": RunnablePassthrough()
    })
    # |(lambda x: {"questions": x["questions"], "course_details": log_course_details(x["course_details"])}) #type: ignore
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
     | get_planner_context
)

course_subject_planner_workflow = course_subject_planner_prompt | llm.with_structured_output(Curriculum)

prerequisite_planner_workflow = (
RunnableBranch((
    is_prerequisite_required, 
    prerequisite_planner_chain ), 
    RunnableLambda(lambda x: None)
))

content_injector_workflow = (
    get_creator_context 
    | (lambda x: add_prop(x , 
                          "skill_description" , 
                          str(get_description(Skill))
                          ))
    | content_injector_chain
)


planner_workflow = (
time_divider_workflow 
| RunnableParallel({
     "course_plan": course_subject_planner_workflow,
     "prerequisite_plan": prerequisite_planner_workflow
})
)





# ====================================
#             Test Run
# ====================================

user_input = "Build me a course on Operating Systems."



# response = time_divider_workflow.invoke(course_details)

# print_dict(response)

# response = llm.invoke("Suppose there is a 3rd year B.Tech IT student trying to learn Operating Systems for his upcoming semester exams. When asked about how difficult he wants the course to be on a scale of 1 to 10 he has opted for 7. He wants to complete the course by 3rd December 2025 and today is 28th November 2025. How much time of his course_duration should he give to learning prerequisites before jumping to the main section??")
# def show(response):
#     print_curriculum(response) if type(response) == Curriculum  else print_dict(response)

# print(response["prerequisite_plan"], "\n\n\n\n\n")

# print("Prerequisite Plan\n")
# show(response["prerequisite_plan"])

# print("Course Plan\n")
# show(response["course_plan"])

# print("\n\n\n\n\n\n\n\n\n\nCombined Plan\n")
# show(add_curriculum(response["prerequisite_plan"] , response["course_plan"]))
# print(response.content)


new_skill = Skill(name='Variables and Data Types', details='Understanding basic data types (int, char, float, pointers) and variable declaration.', introduction=None, body=None, conclusion=None)

response = content_injector_workflow.invoke({"input": new_skill })
print(response)

# response = course_details_workflow.invoke({
#      "text": "Build me a course on Operating Systems. I want the course to be moderately difficult, around 7 out of 10. I need to prepare for an upcoming semester exam and I am currently at my 3rd year, B.E., Information Technology at Jadavpur University. I aim to complete the course by 3rd May 2026.",

#      "course_details_description": str(get_description(CourseDetails))

# })

# print("\n\n\nFinal Course Details\n\n\n")
# print(type(response), response)