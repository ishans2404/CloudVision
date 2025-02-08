from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yaml
import json
import io
import requests
import os
import time
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
    return JSONResponse(content=graph_data)

@app.post("/get-recommendations/")
async def get_recommendations(file: UploadFile = File(...)):
    contents = await file.read()
    docker_compose_data = yaml.safe_load(contents)
    graph_data = process_docker_compose(docker_compose_data)   
    llm_inference = generate(docker_compose_data=str(docker_compose_data), graph_data=graph_data)
    return JSONResponse(content=llm_inference)
    # print("test")
    # time.sleep(5)
    # print(JSONResponse(content="hello world"))
    # return JSONResponse(content="hello world")

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
        You are an assistant tasked with analyzing cloud application setups. 

        You are provided with the following:
        1. A Docker Compose file that defines the services, their configurations, and how they interact.
        2. A dependency graph that represents the relationships between the services and components in the cloud application.

        Your task is to:
        - Analyze the provided Docker Compose file and dependency graph.
        - Identify potential issues related to reliability, redundancy, scaling, and overall system performance.
        - Focus on detecting **single points of failure (SPOFs)**, **bottlenecks**, and **vulnerabilities** that could impact the application.
        - Provide **actionable insights** for improving system robustness, scalability, backup strategies, and monitoring.
        - Present your analysis in **bullet points** for clarity.

        The expected outcomes are:
        - Increased reliability of the cloud application.
        - Minimization of downtimes.
        - Improved performance and scalability.
        - Better fault tolerance and security.

        Do not include unnecessary narrative or context about the optimization process.
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