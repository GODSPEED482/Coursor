import pika
import json
import uuid
import argparse
import os

parser = argparse.ArgumentParser(description="Course Planner Worker")
parser.add_argument("--model", type=str, default="gemini-2.5-flash-lite", help="LLM model to use")
parser.add_argument("--api-key", type=str, help="API key for the LLM")
args, _ = parser.parse_known_args()

if args.model:
    os.environ["LLM_MODEL"] = args.model
if args.api_key:
    os.environ["GOOGLE_API_KEY"] = args.api_key

from workflow import planner_workflow

# Helper function to obtain individual skills from the course_plan and publish them to the content_injector_queue for content generation
def generate_content(ch, curriculum, properties):
    course_plan = curriculum['course_plan'] #type: ignore
    for day_no, section in enumerate(course_plan.sections): #type: ignore
            for skill_no, skill in enumerate(section.skills): #type: ignore
                message = skill.model_dump_json() #type: ignore
                properties = pika.BasicProperties(
                    message_id=properties.message_id, 
                    reply_to=properties.reply_to,
                    headers={
                        **properties.headers,
                        "content_type": "skill",
                        "is_main_content": True,
                        "day_no": day_no,
                        "skill_no": skill_no
                    }
                )
                publish(ch, "content_injector_queue", message, properties)
                identifier = {"day_no": day_no, "skill_no": skill_no, "is_main_content": True}
                log(ch, properties, "info", "skill_queued", identifier)
    
    prerequisite_plan = curriculum['prerequisite_plan'] #type: ignore
    if prerequisite_plan:
        for day_no, section in enumerate(prerequisite_plan.sections): #type: ignore
                for skill_no, skill in enumerate(section.skills): #type: ignore
                    message = skill.model_dump_json() #type: ignore
                    properties = pika.BasicProperties(
                        message_id=properties.message_id, 
                        reply_to=properties.reply_to,
                        headers={
                            **properties.headers,
                            "is_main_content": False,
                            "day_no": day_no,
                            "skill_no": skill_no
                        }
                    )
                    publish(ch, "content_injector_queue", message, properties)
                    identifier = {"day_no": day_no, "skill_no": skill_no, "is_main_content": False}
                    log(ch, properties, "info", "skill_queued", identifier)
    

def log(ch, properties, type, status, identifier=None):
    ch.basic_publish(
        exchange='',
        routing_key=properties.headers['log_to'],
        properties=properties,
        body=json.dumps({
            "type": type,
            "status": status,
            "identifier": identifier if identifier else None
        })
    )

def publish(ch, queue_name, message, properties):
    ch.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(message), properties=properties)

def on_consume(ch, method, properties, body):
    try:
        print(f"Received message: {properties.message_id}")
        data = json.loads(body)
        print("Message content:")
        print(data)
        print("Invoking workflow...");
        curriculum = planner_workflow.invoke(data)
        import time
        print("Waiting 15 seconds to respect rate limits...")
        time.sleep(15)

        course_plan = curriculum['course_plan'] #type: ignore
        prerequisite_plan = curriculum['prerequisite_plan'] #type: ignore
        message = {
            "course_plan": course_plan.model_dump() if course_plan else None, #type: ignore
            "prerequisite_plan": prerequisite_plan.model_dump() if prerequisite_plan else "" #type: ignore
        }
        
        print("Course plan generated:")
        print(curriculum)

        ch.basic_publish(
            exchange='', 
            routing_key=properties.reply_to, 
            body=json.dumps(message), 
            properties= pika.BasicProperties(
                message_id=properties.message_id, 
                reply_to=properties.reply_to,
                headers={
                    **properties.headers,
                    "content_type": "plan"
                }
            )
        )
        log(ch, properties, "info", "cp_gen")
        generate_content(ch, curriculum, properties)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=0))
    channel = connection.channel()
    channel.queue_declare(queue='course_planner_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='course_planner_queue', on_message_callback=on_consume)
    print("Waiting for messages...")
    channel.start_consuming()

if __name__ == "__main__":
    main()