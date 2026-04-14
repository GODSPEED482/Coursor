import pika
import json
import uuid
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
                        "is_main_content": True,
                        "day_no": day_no,
                        "skill_no": skill_no
                    }
                )
                publish(ch, "content_injector_queue", message, properties)
    
    prerequisite_plan = curriculum['prerequisite_plan'] #type: ignore
    if prerequisite_plan:
        for day_no, section in enumerate(prerequisite_plan.sections): #type: ignore
                for skill_no, skill in enumerate(section.skills): #type: ignore
                    message = skill.model_dump_json() #type: ignore
                    properties = pika.BasicProperties(
                        message_id=properties.message_id, 
                        reply_to=properties.reply_to,
                        headers={
                            "is_main_content": False,
                            "day_no": day_no,
                            "skill_no": skill_no
                        }
                    )
                    publish(ch, "content_injector_queue", message, properties)
    

def publish(ch, queue_name, message, properties):
    ch.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(message), properties=properties)

def on_consume(ch, method, properties, body):
    print(f"Received message: {properties.message_id}")
    data = json.loads(body)
    print("Message content:")
    print(data)
    print("Invoking workflow...");
    curriculum = planner_workflow.invoke(data)

    course_plan = curriculum['course_plan'] #type: ignore
    prerequisite_plan = curriculum['prerequisite_plan'] #type: ignore
    message = {
        "course_plan": course_plan.model_dump() if course_plan else None, #type: ignore
        "prerequisite_plan": prerequisite_plan.model_dump() if prerequisite_plan else "" #type: ignore
    }
    print("Course plan generated:")
    print(curriculum)
    ch.basic_ack(delivery_tag=method.delivery_tag)
    ch.basic_publish(exchange='', routing_key=properties.reply_to, body=json.dumps(message), properties=properties)
    ch.basic_publish(exchange='', routing_key=properties.headers['log_to'], body=json.dumps({
        "message_id": properties.message_id,
        "status": "cp_gen"
    }))
    generate_content(ch, curriculum, properties)
    

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='course_planner_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='course_planner_queue', on_message_callback=on_consume)
    print("Waiting for messages...")
    channel.start_consuming()

if __name__ == "__main__":
    main()