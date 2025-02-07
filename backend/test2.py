import requests
import json
import os
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json", 
}

def generate(docker_compose_data, graph_data):
    system_prompt = """
        You are a helpful assistant specializing in cloud application analysis.
        You have been provided with two key pieces of information:
        1. A Docker Compose file representing the cloud application's infrastructure and services.
        2. A dependency graph illustrating the relationships and dependencies between the application's components.
        Cloud applications are often affected by bottlenecks or single points of failure due to complex and intricate dependencies. Your task is to:
        - Analyze the provided Docker Compose file to understand the architecture and components involved in the application.
        - Examine the dependency graph to identify any critical points where bottlenecks or failure risks might occur.
        - Detect and flag potential dependency bottlenecks or single points of failure in the application architecture.
        - Provide actionable insights and recommendations to improve the system's robustness, scalability, and fault tolerance. 
        The expected outcomes are:
        - More reliable cloud applications, with improved fault tolerance.
        - Minimized downtimes through early identification and resolution of vulnerabilities.
        - Improved system performance by optimizing dependencies and eliminating inefficiencies.
        Please ensure your recommendations are practical and based on best practices for cloud system optimization.
        """
    message = [
        {
            "role": "user",
            "content": f"{system_prompt}\nDocker Compose Data:{docker_compose_data}\nGraph Data: {graph_data}"
        }
    ]
    response = requests.post(
        url=url,
        headers=headers,
        data=json.dumps({
            "model": "deepseek/deepseek-r1-distill-llama-70b:free",  
            "messages": message,  
        })
    )
    if response.status_code == 200:
        data = response.json()
        model_reply = data.get("choices", [])[0].get("message", {}).get("content")
        print(f"Model: {model_reply}")
        return model_reply
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return f"Error: {response.status_code}, {response.text}"