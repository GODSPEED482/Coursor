import os
import subprocess
import sys
from dotenv import load_dotenv

def main():
    # Load the .env file
    load_dotenv()
    
    # Retrieve the API keys
    api_key_1 = os.environ.get("API_KEY_1")
    api_key_2 = os.environ.get("API_KEY_2")
    api_key_3 = os.environ.get("API_KEY_3")
    api_key_4 = os.environ.get("API_KEY_4")
    
    if not all([api_key_1, api_key_2, api_key_3, api_key_4]):
        print("Error: Missing one or more API keys (API_KEY_1 to API_KEY_4) in the .env file.")
        sys.exit(1)

    print("Starting workers...")
    
    processes = []
    
    # 3 instances of content_injector_worker running in parallel
    print("Starting content_injector_worker 1 (API_KEY_1)")
    processes.append(subprocess.Popen([sys.executable, "content_injector_worker.py", "--api-key", api_key_1]))
    
    print("Starting content_injector_worker 2 (API_KEY_2)")
    processes.append(subprocess.Popen([sys.executable, "content_injector_worker.py", "--api-key", api_key_2]))
    
    print("Starting content_injector_worker 3 (API_KEY_3)")
    processes.append(subprocess.Popen([sys.executable, "content_injector_worker.py", "--api-key", api_key_3]))
    
    # 1 instance of course_details_worker
    print("Starting course_details_worker (API_KEY_4)")
    processes.append(subprocess.Popen([sys.executable, "course_details_worker.py", "--api-key", api_key_4]))
    
    # 1 instance of course_planner_worker
    print("Starting course_planner_worker (API_KEY_4)")
    processes.append(subprocess.Popen([sys.executable, "course_planner_worker.py", "--api-key", api_key_4]))
    
    print(f"\nAll {len(processes)} worker processes successfully started in parallel!")
    print("Press Ctrl+C to stop all workers.\n")
    
    # Keep the main process alive, blocking until children exit. Handle KeyboardInterrupt.
    try:
        for p in processes:
            p.wait()
    except KeyboardInterrupt:
        print("\nTerminating all worker processes...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.wait()
        print("All workers terminated successfully.")

if __name__ == "__main__":
    main()
