from langchain.prompts import ChatPromptTemplate

def get_description(cls):
    description = { 
    name : field.description
    for name, field in cls.model_fields.items()
    }
    return description