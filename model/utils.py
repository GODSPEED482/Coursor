from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableLambda
from datetime import date
from interrogator_utils import CourseDetails



class Validate(BaseModel):
     is_valid: bool     





def get_description(cls):
    description = { 
    name : [field.annotation, field.description]
    for name, field in cls.model_fields.items()
    }
    return description

def add_prop(x, prop_name: str, prop_val) -> dict:
    x[prop_name] = prop_val
    return x

def del_prop(x: dict, prop_name: str) -> dict:
    if prop_name in x.keys():
        x.pop(prop_name)
    return x

def print_dict(x: dict):
    for key, value in x.items():
        print(f"{key}: {value}")

def add_today(x):
    x["today_date"] = date.today()
    return x

def flatten_dict(x: dict) -> dict:
    nest_dict_keys = []
    for key, value in x.items():
        if type(value) == dict:
            nest_dict_keys.append(key)
    for key in nest_dict_keys:
        x[key] = flatten_dict(x[key])
        temp = x[key]
        x.pop(key)
        for subkey, subval in temp.items():
            x[subkey] = subval
    return x

# print_dict(flatten_dict({
#     "course_details": {
#         "title": "Operating Systems",
#         "duration":  "6 days"
#     },
#     "deadline": '2025-11-27',
#     "current_date":  '2025-11-21'
# }))