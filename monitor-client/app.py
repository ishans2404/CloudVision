import subprocess
import json
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from typing import List

app = FastAPI()

# ----------------------------------------
# Index Page Endpoint (/)
# ----------------------------------------
@app.get("/", response_class=HTMLResponse)
def read_index():
    # Serve the external index.html file.
    return FileResponse("index.html")

# Vulscanning page endpoint
@app.get("/vulscan", response_class=HTMLResponse)
def serve_vulscan_page():
    """
    Serves the vultesting.html page.
    """
    return FileResponse("vulscan.html")


# ----------------------------------------
# Vulnerability Scanning Endpoint (/vultest)
# ----------------------------------------
@app.get("/vultest")
async def vul_test_get(images: str = None):
    """
    If a comma-separated list of Docker image names is provided via the query parameter 'images',
    then scans those images for HIGH/CRITICAL vulnerabilities using Trivy.
    
    If no query parameter is provided, the endpoint automatically retrieves the list of running images
    (in the format: {"repository": "tag", ...}), constructs image strings as 'repository:tag',
    and scans each one.
    
    Examples:
      Manual mode:
        GET http://host.docker.internal:5001/vultest?images=wordpress:latest,nginx:alpine
      Automatic mode (uses running images):
        GET http://host.docker.internal:5001/vultest
    """
    # If the caller provides images, use them; otherwise, get running images automatically.
    if images:
        image_list = [img.strip() for img in images.split(",") if img.strip()]
    else:
        running_images = get_running_images()  # returns dict of {repository: tag}
        image_list = [f"{repo}:{tag}" for repo, tag in running_images.items()]

    results = []
    for image in image_list:
        try:
            vulnerabilities = scan_docker_image(image)
            if vulnerabilities:
                high_count = sum(1 for v in vulnerabilities if v["severity"] == "HIGH")
                critical_count = sum(1 for v in vulnerabilities if v["severity"] == "CRITICAL")
                comment = f"{high_count} HIGH and {critical_count} CRITICAL vulnerabilities found"
            else:
                comment = "No HIGH or CRITICAL vulnerabilities found"
            results.append({
                "image": image,
                "vulnerabilities": vulnerabilities,
                "comments": comment
            })
        except Exception as e:
            results.append({
                "image": image,
                "error": str(e)
            })

    return {"results": results}


def scan_docker_image(image: str):
    """
    Scans a Docker image with Trivy and returns a list of vulnerabilities with severity HIGH or CRITICAL.
    
    Each vulnerability in the list includes:
      - cve: Vulnerability ID.
      - severity: Severity level.
      - package: Affected package.
      - installed: Installed package version.
      - fixed: The version that fixes the vulnerability.
      - solution: Suggested upgrade solution.
      - nvd link: Link to the NVD details page for the vulnerability.
    """
    try:
        # Run the Trivy scan with JSON output.
        result = subprocess.run(
            ["trivy", "image", "--format", "json", image],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise Exception(f"Trivy scan failed: {result.stderr}")

        json_data = json.loads(result.stdout)
        vulnerability_results = json_data.get("Results", [])
        vuln_list = []

        for res in vulnerability_results:
            for vuln in res.get("Vulnerabilities", []):
                if vuln["Severity"] in ["HIGH", "CRITICAL"]:
                    solution = f"Upgrade {vuln['PkgName']} to {vuln.get('FixedVersion', 'latest available version')}"
                    vuln_item = {
                        "cve": vuln["VulnerabilityID"],
                        "severity": vuln["Severity"],
                        "package": vuln["PkgName"],
                        "installed": vuln["InstalledVersion"],
                        "fixed": vuln.get("FixedVersion", "Not Fixed"),
                        "solution": solution,
                        "nvd link": f"https://nvd.nist.gov/vuln/detail/{vuln['VulnerabilityID']}"
                    }
                    vuln_list.append(vuln_item)
        return vuln_list

    except Exception as e:
        raise Exception(f"Error scanning image {image}: {e}")


# ----------------------------------------
# Docker Metrics Endpoint (/metrics)
# ----------------------------------------
def get_containers():
    """
    Uses 'docker ps' to list running containers.
    Returns a list of dictionaries with basic container info.
    """
    cmd = ["docker", "-H", "tcp://host.docker.internal:2375", "ps", "--format", "{{json .}}"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result)
    containers = []
    for line in result.stdout.splitlines():
        try:
            container_data = json.loads(line)
            containers.append(container_data)
        except json.JSONDecodeError:
            continue
    return containers


def get_container_stats():
    """
    Uses 'docker stats' (non-streaming) to retrieve resource usage metrics.
    Returns a dictionary mapping container IDs to their stats.
    """
    cmd = ["docker", "-H", "tcp://host.docker.internal:2375", "stats", "--no-stream", "--format", "{{json .}}"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    stats = {}
    for line in result.stdout.splitlines():
        try:
            stat = json.loads(line)
            container_id = stat.get("Container")
            if container_id:
                stats[container_id] = {
                    "cpu_percent": stat.get("CPUPerc"),
                    "memory_usage": stat.get("MemUsage"),
                    "memory_percent": stat.get("MemPerc"),
                    "network_io": stat.get("NetIO"),
                    "block_io": stat.get("BlockIO"),
                    "pids": stat.get("PIDs"),
                    "online_cpus": stat.get("OnlineCPUs"),  # May be None if not provided
                }
        except json.JSONDecodeError:
            continue
    return stats


def parse_datetime(dt_str):
    """
    Parses a Docker timestamp in ISO format.
    Removes extra fractional-second digits if necessary.
    """
    if '.' in dt_str:
        main, frac = dt_str.rstrip('Z').split('.')
        # Limit fraction to microseconds (6 digits)
        frac = frac[:6]
        dt_str = f"{main}.{frac}Z"
    try:
        return datetime.datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError:
        try:
            return datetime.datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return None


def get_container_inspect(container_id):
    """
    Uses 'docker inspect' to retrieve detailed container information.
    Extracts container state, health, start time (for uptime), restart count,
    and network metrics.
    """
    cmd = ["docker", "-H", "tcp://host.docker.internal:2375", "inspect", container_id]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        inspect_data = json.loads(result.stdout)[0]
        state = inspect_data.get("State", {})
        container_state = state.get("Status")
        health = None
        if "Health" in state and state["Health"]:
            health = state["Health"].get("Status")
        # Read restart count from the top-level (not from state)
        restart_count = inspect_data.get("RestartCount")
        started_at_str = state.get("StartedAt")
        uptime_seconds = None
        if started_at_str:
            start_dt = parse_datetime(started_at_str)
            if start_dt:
                uptime_seconds = (datetime.datetime.utcnow() - start_dt).total_seconds()
        # Get network metrics from the Networks section of NetworkSettings
        network_metrics = inspect_data.get("NetworkSettings", {}).get("Networks", {})
        return {
            "state": container_state,
            "health": health,
            "uptime": uptime_seconds,
            "restart_count": restart_count,
            "network_metrics": network_metrics,
        }
    except Exception as e:
        print("Error inspecting container", container_id, ":", e)
        return {}


def collect_metrics():
    """
    Collects metrics from Docker by combining basic container info, resource usage,
    and detailed inspection data.
    """
    containers = get_containers()
    stats_data = get_container_stats()
    metrics = []
    for container in containers:
        container_id = container.get("ID")
        container_name = container.get("Names")
        image_name = container.get("Image")
        stats = stats_data.get(container_id, {})
        inspect_info = get_container_inspect(container_id)
        metric_entry = {
            "container_name": container_name,
            "image_name": image_name,
            "resource_usage": stats,
            "state": inspect_info.get("state"),
            "health": inspect_info.get("health"),
            "uptime": inspect_info.get("uptime"),
            "restart_count": inspect_info.get("restart_count"),
            "network_metrics": inspect_info.get("network_metrics"),
        }
        metrics.append(metric_entry)
    return metrics

@app.get("/metrics")
def get_metrics():
    data = collect_metrics()
    return data


# ----------------------------------------
# Docker Running Images Endpoint (/images)
# ----------------------------------------
def get_running_images():
    """
    Uses 'docker ps' to list running containers and extracts their image names.
    Returns a dictionary mapping image repositories to their tags.
    Example output: {"wordpress": "latest", "nginx": "alpine"}
    """
    cmd = ["docker", "-H", "tcp://host.docker.internal:2375", "ps", "--format", "{{json .}}"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    images = {}
    for line in result.stdout.splitlines():
        try:
            container_data = json.loads(line)
            image = container_data.get("Image", "")
            if image:
                repository, _, tag = image.partition(":")
                tag = tag if tag else "latest"
                images[repository] = tag
        except json.JSONDecodeError:
            continue
    return images

@app.get("/images")
def get_images():
    """
    Endpoint to return a JSON list of images of currently running containers in the format:
    {
      "wordpress": "latest",
      "nginx": "alpine"
    }
    """
    images = get_running_images()
    return images


# ----------------------------------------
# Run the Combined Server
# ----------------------------------------
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
