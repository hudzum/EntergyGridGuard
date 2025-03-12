import os
import datetime
from fastapi import UploadFile, File
from .database import save_image_to_db
import re
from dotenv import load_dotenv, find_dotenv
from sshtunnel import SSHTunnelForwarder
import requests
import json
from PIL import Image
import piexif
import io
import logging
load_dotenv(find_dotenv())

SSH_HOST = "45.21.85.155"
SSH_PORT = 34130
# Define environmental variables for your own GIZMO username and ssh key path.
SSH_USERNAME = os.getenv("SSH_USERNAME")
SSH_KEY_PATH = os.getenv("SSH_KEY_PATH")

REMOTE_BIND_ADDRESS = ("0.0.0.0", 5353)
LOCAL_BIND_ADDRESS = ("127.0.0.1", 0)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

API_ENDPOINT = "/analyze-image/"

def extract_lat_long(image_path):
    """
    Extract the GPS latitude and longitude from the image's metadata
    """
    try:
        # Open the image
        image = Image.open(image_path)
        # Load EXIF data (metadata)
        exif_dict = piexif.load(image.info.get('exif'))
        gps_info = exif_dict.get('GPS', {})

        if not gps_info:
            print("No GPS data found in image.")
            return None

        # Extract latitude and longitude
        lat_deg = gps_info.get(piexif.GPSIFD.GPSLatitude)
        lat_ref = gps_info.get(piexif.GPSIFD.GPSLatitudeRef)
        lon_deg = gps_info.get(piexif.GPSIFD.GPSLongitude)
        lon_ref = gps_info.get(piexif.GPSIFD.GPSLongitudeRef)

        if lat_deg and lon_deg and lat_ref and lon_ref:
            # Convert DMS to decimal degrees (A lot of math)
            def dms_to_dd(dms, ref):
                degrees = dms[0][0] / dms[0][1]
                minutes = dms[1][0] / dms[1][1] / 60.0
                seconds = dms[2][0] / dms[2][1] / 3600.0
                dd = degrees + minutes + seconds
                if ref in ['S', 'W']:
                    dd = -dd
                return dd

            latitude = dms_to_dd(lat_deg, lat_ref)
            longitude = dms_to_dd(lon_deg, lon_ref)

            return {"latitude": latitude, "longitude": longitude} # Need to add these to the components json
        else:
            print("Incomplete GPS data in the image.")
            return None

    except Exception as e:
        print(f"Error extracting GPS data: {e}")
        return None

def send_image(image_path):
    """
    Opens an SSH tunnel to the remote API, sends the image along with a question,
    and returns the parsed JSON response from the API.
    """
    print("Attempting to SHH TUNNEL Local port is ")
    print(f"SSH_USERNAME: {os.getenv('SSH_USERNAME')}")
    print(f"SSH_KEY_PATH: {os.getenv('SSH_KEY_PATH')}")
    
    if not os.path.exists(SSH_KEY_PATH):
        return {"error": f"SSH key file not found at: {SSH_KEY_PATH}"}
    try:
        logging.basicConfig(level=logging.DEBUG)
        with SSHTunnelForwarder(
            (SSH_HOST, SSH_PORT),
            ssh_username=SSH_USERNAME,
            ssh_pkey=SSH_KEY_PATH,
            remote_bind_address=REMOTE_BIND_ADDRESS,
            local_bind_address=LOCAL_BIND_ADDRESS
        ) as tunnel:
            # SSH tunnel is now established.
            local_port = tunnel.local_bind_port
            api_url = f"http://127.0.0.1:{local_port}{API_ENDPOINT}"
            print(f"Tunnel established. Using API URL: {api_url}")
        # Send the image to the API.
            with open(image_path, "rb") as img:
                files = {"file": img}
                response = requests.post(api_url, files=files)
                return response.json()
    except Exception as e:
        return {"error": "Failed inside of Send_image:: "+str(e)}


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

async def upload_image(file: UploadFile = File(...)):
    try:
        print("Current working directory:", os.getcwd())

        # Read the uploaded file as binary
        image_data = await file.read()

        # Open the image using PIL
        image = Image.open(io.BytesIO(image_data))

        # Extract EXIF data before conversion since by default, conversion through PIL strips metadata
        exif_bytes = image.info.get("exif")

        # Convert the image to RGB mode
        image = image.convert("RGB")
        timestamp = datetime.datetime.now().timestamp()

        # Convert to jpeg (Assuming there are still issues with the llm when it is not jpeg)
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}.jpeg")

        if exif_bytes:
            image.save(file_path, "JPEG", quality=95, exif=exif_bytes)  # Keep metadata and adjust quality as needed
        else:
            image.save(file_path, "JPEG", quality=95)  # No metadata if none exists

        #with open(file_path, "wb") as f:
             #f.write(image_data)

        print(f"Image saved to: {os.path.abspath(file_path)}")

        # Add this to components later
        gps_data = extract_lat_long(file_path)
        print("GPS:", gps_data)

        llm_response = send_image(file_path)  # Send the image to the LLM API via SSH tunnel
        components = parse_response(llm_response)  # Parse the response into valid JSON format

        # Convert the saved JPEG back to binary data for DB storage
        with open(file_path, "rb") as f:
            jpeg_data = f.read()

        image_id = save_image_to_db(jpeg_data, components)

        if image_id:
            return {"message": "Image uploaded successfully", "image_id": image_id}
        else:
            return {"error": "Failed to save image to database"}

    except Exception as e:
        return {"error": "Failed at Upload_image"+ str(e)}