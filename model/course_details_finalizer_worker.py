import pika
import json
import argparse
import os

parser = argparse.ArgumentParser(description="Course Details Finalizer Worker")
parser.add_argument("--model", type=str, default="gemini-2.5-flash-lite", help="LLM model to use")
parser.add_argument("--api-key", type=str, help="API key for the LLM")
args, _ = parser.parse_known_args()

if args.model:
    os.environ["LLM_MODEL"] = args.model
if args.api_key:
    os.environ["GOOGLE_API_KEY"] = args.api_key

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../rabbitmq.env'))

from workflow import course_details_finalizer_workflow

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

def on_consume(ch, method, properties, body):
    try:
        print(f"Received message: {properties.message_id}")
        data = json.loads(body)
        print("Invoking finalizer workflow...");
        
        # expected data: { "course_details": dict, "unspecified_properties": list, "user_responses": list }
        final_course_details = course_details_finalizer_workflow.invoke(data)
        
        import time
        print("Waiting 15 seconds to respect rate limits...")
        time.sleep(15)

        print("Final Course details generated:", type(final_course_details))
        print(final_course_details)
        
        
        # Send to planner queue
        ch.basic_publish(
            exchange='', 
            routing_key=os.environ.get('PLANNER_QUEUE', "course_planner_queue"), 
            body=json.dumps(final_course_details), 
            properties=properties
        )
        log(ch, properties, "info", "course_details_fin")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://localhost')
    print(f"Connecting to RabbitMQ at {os.environ.get('RABBITMQ_HOST', 'localhost')}...")
    connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
    channel = connection.channel()
    queue_name = os.environ.get('FINALIZER_QUEUE', 'course_details_finalizer_queue')
    channel.queue_declare(queue=queue_name)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=on_consume)
    print(f"Waiting for messages on {queue_name}...")
    channel.start_consuming()

if __name__ == "__main__":
    main()
