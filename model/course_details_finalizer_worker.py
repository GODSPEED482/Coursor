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
            routing_key="course_planner_queue", 
            body=json.dumps(final_course_details), 
            properties=properties
        )
        log(ch, properties, "info", "course_details_fin")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=0))
    channel = connection.channel()
    channel.queue_declare(queue='course_details_finalizer_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='course_details_finalizer_queue', on_message_callback=on_consume)
    print("Waiting for messages on course_details_finalizer_queue...")
    channel.start_consuming()

if __name__ == "__main__":
    main()
