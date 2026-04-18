import pika
import json
import argparse
import os

parser = argparse.ArgumentParser(description="Course Details Initializer Worker")
parser.add_argument("--model", type=str, default="gemini-2.5-flash-lite", help="LLM model to use")
parser.add_argument("--api-key", type=str, help="API key for the LLM")
args, _ = parser.parse_known_args()

if args.model:
    os.environ["LLM_MODEL"] = args.model
if args.api_key:
    os.environ["GOOGLE_API_KEY"] = args.api_key

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../rabbitmq.env'))

from utils import get_description
from workflow import course_details_initializer_workflow
from interrogator_utils import CourseDetails

def log(ch, properties, type, status):
    ch.basic_publish(
        exchange='',
        routing_key=properties.headers['log_to'],
        properties=properties,
        body=json.dumps({
            "type": type,
            "status": status
        })
    )

def ask(ch, properties, questions, course_details):
    ch.basic_publish(
        exchange='',
        routing_key=properties.reply_to,
        properties=properties,
        body=json.dumps({
            "questions": questions,
            "course_details": course_details
        })
    )

def on_consume(ch, method, properties, body):
    try:
        print(f"Received message: {properties.message_id}")
        data = json.loads(body)
        print("Invoking initializer workflow...");
        
        result = course_details_initializer_workflow.invoke({
            **data, 
            "course_details_description": str(get_description(CourseDetails))
        })
        
        import time
        print("Waiting 15 seconds to respect rate limits...")
        time.sleep(15)

        questions = result["questions"]
        course_details = result["course_details"]
        
        if len(questions) == 0:
            print("No questions generated. Publishing directly to course_planner_queue.")

        reply_to_queue = properties.reply_to if properties.reply_to else None
        log_to_queue = properties.headers.get('log_to') if properties.headers else None
       
        if log_to_queue:
            log(ch, properties, "info", "course_details_init")
        else:
            print("No log_to header found. Dropping message.")
        
        if reply_to_queue:
            ask(
                ch = ch,
                properties = pika.BasicProperties(
                    message_id = properties.message_id,
                    reply_to=properties.reply_to,
                    headers = {
                        **properties.headers,
                        "content_type": "question"
                    }
                ),
                questions = questions,
                course_details = course_details)
        else:
            print("No reply_to header found. Dropping message.")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://localhost')
    print(f"Connecting to RabbitMQ at {os.environ.get('RABBITMQ_HOST', 'localhost')}...")
    connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
    channel = connection.channel()
    queue_name = os.environ.get('INITIALIZER_QUEUE', 'course_details_initializer_queue')
    channel.queue_declare(queue=queue_name)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=on_consume)
    print(f"Waiting for messages on {queue_name}...")
    channel.start_consuming()

if __name__ == "__main__":
    main()
