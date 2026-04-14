import pika
import json
import argparse
import os

parser = argparse.ArgumentParser(description="Course Details Worker")
parser.add_argument("--model", type=str, default="gemini-2.5-flash-lite", help="LLM model to use")
parser.add_argument("--api-key", type=str, help="API key for the LLM")
args, _ = parser.parse_known_args()

if args.model:
    os.environ["LLM_MODEL"] = args.model
if args.api_key:
    os.environ["GOOGLE_API_KEY"] = args.api_key

from utils import get_description
from workflow import course_details_workflow, course_analyzer_chain
from interrogator_utils import CourseDetails

def on_consume(ch, method, properties, body):
    print(f"Received message: {properties.message_id}")
    data = json.loads(body)
    print("Message content:")
    print(data)
    print("Invoking workflow...");
    course_details = course_details_workflow.invoke({
        **data, 
        "course_details_description": str(get_description(CourseDetails))
    })
    import time
    print("Waiting 15 seconds to respect rate limits...")
    time.sleep(15)
    print("Course details generated:", type(course_details))
    print(course_details)
    ch.basic_ack(delivery_tag=method.delivery_tag)
    ch.basic_publish(exchange='', routing_key=properties.headers['log_to'], body=json.dumps({
        "message_id": properties.message_id,
        "status": "cd_gen"
    }))
    ch.basic_publish(exchange='', routing_key="course_planner_queue", body=json.dumps(course_details), properties=properties)

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='course_details_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='course_details_queue', on_message_callback=on_consume)
    print("Waiting for messages...")
    channel.start_consuming()

if __name__ == "__main__":
    main()