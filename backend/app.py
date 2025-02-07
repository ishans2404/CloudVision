from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yaml
import json
import io
import requests
import os
from dotenv import load_dotenv
load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json", 
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-docker-compose/")
async def upload_docker_compose(file: UploadFile = File(...)):
    # Read and parse the Docker Compose file
    contents = await file.read()
    docker_compose_data = yaml.safe_load(contents)
    
    # Process the data to extract relevant information
    graph_data = process_docker_compose(docker_compose_data)
    
    # Return the structured data as a JSON response
    print(graph_data)
    return JSONResponse(content=graph_data)

@app.post("/get-recommendations/")
async def get_recommendations(file: UploadFile = File(...)):
    # Read and parse the Docker Compose file
    contents = await file.read()
    docker_compose_data = yaml.safe_load(contents)
    graph_data = process_docker_compose(docker_compose_data)   
    llm_inference = generate(docker_compose_data=str(docker_compose_data), graph_data=graph_data)
    return JSONResponse(content=llm_inference)

def process_docker_compose(compose_data):
    services = compose_data.get("services", {})
    graph_data = {
        "nodes": [],
        "edges": []
    }

    for service_name, service_info in services.items():
        service_node = {
            "id": service_name,
            "label": service_name,
            "type": "service",
            "image": service_info.get("image", ""),
            "dependencies": service_info.get("depends_on", []),
            "ports": service_info.get("ports", []),
            "networks": list(service_info.get("networks", [])),
            "volumes": list(service_info.get("volumes", [])),
            "restart_policy": service_info.get("deploy", {}).get("restart_policy", {}).get("condition", "on-failure")
        }

        graph_data["nodes"].append(service_node)

        # Add service dependencies
        for dependency in service_node["dependencies"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": dependency,
                "type": "dependency",
                "dependency_type": "Generic"  # Customize based on actual logic
            })

        # Add network edges
        for network in service_node["networks"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"network-{network}",
                "type": "network",
                "info": f"Connected to {network} network"
            })

        # Add volume edges
        for volume in service_node["volumes"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"volume-{volume}",
                "type": "volume",
                "info": f"Mounted volume {volume}"
            })

        # Add port edges (simple connection between service and port)
        for port in service_node["ports"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"port-{port}",
                "type": "port",
                "info": f"Exposes port {port}"
            })

    # Return the formatted graph data
    return graph_data

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