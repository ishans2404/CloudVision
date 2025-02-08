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
DOCKER_FASTAPI_URL=os.getenv('DOCKER_FASTAPI_URL')
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
    # read/parse docker compose file
    contents = await file.read()
    docker_compose_data = yaml.safe_load(contents)
    # extract relevant graph information
    graph_data = process_docker_compose(docker_compose_data)
    # return JSON response
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

@app.get("/vulnerabilities/")
async def vulnerabilities():
    try:
        response = requests.get(f"{DOCKER_FASTAPI_URL}/vultest")
        # to ensure successful request
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except requests.exceptions.RequestException as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/metrics/")
async def metrics():
    try:
        response = requests.get(f"{DOCKER_FASTAPI_URL}/metrics")
        # to ensure successful request
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except requests.exceptions.RequestException as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

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

        # add service dependencies
        for dependency in service_node["dependencies"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": dependency,
                "type": "dependency",
                "dependency_type": "Generic" # to customize
            })

        # add network edges
        for network in service_node["networks"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"network-{network}",
                "type": "network",
                "info": f"Connected to {network} network"
            })

        # add volume edges
        for volume in service_node["volumes"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"volume-{volume}",
                "type": "volume",
                "info": f"Mounted volume {volume}"
            })

        # add port edges (connection between service and port)
        for port in service_node["ports"]:
            graph_data["edges"].append({
                "source": service_name,
                "target": f"port-{port}",
                "type": "port",
                "info": f"Exposes port {port}"
            })

    return graph_data

def generate(docker_compose_data, graph_data):
    # system prompt = defines behavior of llm for inference
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
    
    # message object to send to model.
    message = [
        {
            "role": "user",
            "content": f"{system_prompt}\nDocker Compose Data:{docker_compose_data}\nGraph Data: {graph_data}"
        }
    ]

    # post message to the model/get the response.
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
