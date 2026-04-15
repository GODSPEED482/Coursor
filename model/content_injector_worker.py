import pika
import json
import argparse
import os

parser = argparse.ArgumentParser(description="Content Injector Worker")
parser.add_argument("--model", type=str, default="gemini-2.5-flash-lite", help="LLM model to use")
parser.add_argument("--api-key", type=str, help="API key for the LLM")
args, _ = parser.parse_known_args()

if args.model:
    os.environ["LLM_MODEL"] = args.model
if args.api_key:
    os.environ["GOOGLE_API_KEY"] = args.api_key

from workflow import content_injector_workflow
from planner_utils import Skill
from youtube_helper import get_youtube_video_details

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

def on_consume(ch, method, properties, body):
    try:
        print(f"Received message: {properties.message_id}")
        data = json.loads(body)
        print("Message content:")
        print(data)
        print("Invoking workflow...")
        identifier = {"day_no": properties.headers['day_no'], "skill_no": properties.headers['skill_no'], "is_main_content": properties.headers['is_main_content']}
        log(ch, properties, "info", "skill_gen_init", identifier)
        skill_content = content_injector_workflow.invoke({
            "input": Skill.model_validate_json(data)
        })
        import time
        print("Waiting 15 seconds to respect rate limits...")
        time.sleep(15)
        
        if skill_content.body:
            for para in skill_content.body:
                if para.content_type == "video" and para.video is not None:
                    print(f"Resolving YouTube link for: {para.video.title}")
                    video_info = get_youtube_video_details(para.video.title)
                    if video_info:
                        para.video.url = video_info["url"]
                        print(f"Found real link: {para.video.url}")

        log(ch, properties, "info", "skill_gen_fin", identifier)
        print("Content generated for the skill:")
        print(type(skill_content))
        ch.basic_publish(
            exchange='', 
            routing_key=properties.reply_to, 
            body=skill_content.model_dump_json(), 
            properties = properties
        ) #type: ignore
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=0))
    channel = connection.channel()
    channel.queue_declare(queue='content_injector_queue')
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='content_injector_queue', on_message_callback=on_consume)
    print("Waiting for messages...")
    channel.start_consuming()

if __name__ == "__main__":
    main()