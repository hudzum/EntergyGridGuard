import os
import re
import json
from dotenv import load_dotenv
from sshtunnel import SSHTunnelForwarder
import requests

load_dotenv()

SSH_HOST = "45.21.85.155"
SSH_PORT = 34130
# Define environmental variables for your own GIZMO username and ssh key path.
SSH_USERNAME = os.getenv("SSH_USERNAME")
SSH_KEY_PATH = os.getenv("SSH_KEY_PATH")

REMOTE_BIND_ADDRESS = ("0.0.0.0", 5353)
LOCAL_BIND_ADDRESS = ("0.0.0.0", 0)

API_ENDPOINT = "/analyze-image/"

def send_image(image_path):
    """
    Opens an SSH tunnel to the remote API, sends the image along with a question,
    and returns the parsed JSON response from the API.
    """
    with SSHTunnelForwarder(
        (SSH_HOST, SSH_PORT),
        ssh_username=SSH_USERNAME,
        ssh_pkey=SSH_KEY_PATH,
        remote_bind_address=REMOTE_BIND_ADDRESS,
        local_bind_address=LOCAL_BIND_ADDRESS
    ) as tunnel:
        # SSH tunnel is now established.
        local_port = tunnel.local_bind_port
        api_url = f"http://0.0.0.0:{local_port}{API_ENDPOINT}"
        print(f"Tunnel established. Using API URL: {api_url}")

        # Send the image to the API.
        with open(image_path, "rb") as img:
            files = {"file": img}
            response = requests.post(api_url, files=files)
            return response.json()

def parse_response(response):
    """
    Parses the 'response' key in the returned JSON from the API, attempting to extract valid JSON content.
    Returns the parsed JSON object or None if parsing fails.
    """
    response_str = response.get("response", "")
    if isinstance(response_str, list) and response_str:
        response_str = response_str[0]

    # Attempt to extract JSON content from response.
    match = re.search(r"```json\s*(\{.*\})\s*```", response_str, re.DOTALL)
    if match:
        json_content = match.group(1)
    else:
        json_content = response_str.strip()
    
    try:
        parsed_json = json.loads(json_content)
        return parsed_json
    except Exception as e:
        print("Error parsing JSON:", e)
        return None

# if __name__ == "__main__":
#     # Example usage when running this module directly.
#     image_path = "/Users/sammy/Desktop/power_poles/good_pole_3.png"  # Placeholder. Image path defined in main.py
#     result = send_image(image_path)
    
#     parsed_json = parse_response(result)
    
#     if parsed_json is not None:
#         output_filename = "good_pole_3.json"
#         with open(output_filename, "w") as outfile:
#             json.dump(parsed_json, outfile, indent=4)
#         print(f"Output written to {output_filename}")
#     else:
#         print("Failed to parse JSON output.")
