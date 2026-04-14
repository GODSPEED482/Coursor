import pika
import json
from workflow import content_injector_workflow
from planner_utils import Skill
def on_consume(ch, method, properties, body):
    print(f"Received message: {properties.message_id}")
    data = json.loads(body)
    print("Message content:")
    print(data)
    print("Invoking workflow...");
    skill_content = content_injector_workflow.invoke({
        "input": Skill.model_validate_json(data)
    })
    print("Content generated for the skill:")
    print(type(skill_content))
    ch.basic_ack(delivery_tag=method.delivery_tag)
    ch.basic_publish(exchange='', routing_key=properties.reply_to, body=skill_content.model_dump_json(), properties=properties) #type: ignore

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='content_injector_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='content_injector_queue', on_message_callback=on_consume)
    print("Waiting for messages...")
    channel.start_consuming()

if __name__ == "__main__":
    main()