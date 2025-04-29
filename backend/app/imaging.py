import os
import datetime
from fastapi import UploadFile, File
from .database import save_image_to_db
from .api_control import start_api, stop_api
import re
from dotenv import load_dotenv, find_dotenv
from sshtunnel import SSHTunnelForwarder
import requests
import json
from PIL import Image
import piexif
import io
import paramiko
import base64
import logging
load_dotenv(find_dotenv())

# SSH_HOST = "45.21.85.155"
# SSH_PORT = 34130
# Define environmental variables for your own GIZMO username and ssh key path.
# SSH_USERNAME = os.getenv("SSH_USERNAME")
# SSH_KEY = os.getenv("SSH_KEY")
import io

# ssh_pkey = paramiko.ECDSAKey.from_private_key(io.StringIO(str(base64.b64decode(SSH_KEY), "utf-8")))

# REMOTE_BIND_ADDRESS = ("0.0.0.0", 5353)
# LOCAL_BIND_ADDRESS = ("0.0.0.0", 9999)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

API_URL = os.getenv("AI_API_URL")
AI_API_KEY = os.getenv("AI_API_KEY")
AI_MODEL = os.getenv("AI_MODEL")

API_ENDPOINT = "/analyze-image/"

def create_thumbnail(image_data: bytes, max_size=(300,300)) -> bytes:
    """Generate a downscaled version of the image."""
    try:
        image = Image.open(io.BytesIO(image_data))
        image.thumbnail(max_size)

        with io.BytesIO() as output:
            image.save(output, format="JPEG", quality=85)
            thumbnail_data = output.getvalue()

        return thumbnail_data
    except Exception as e:
        print("Error creating thumbnail:", e)
        return None

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

import base64

from openai import OpenAI
def send_image(image_path):
    """
    Opens an SSH tunnel to the remote API, sends the image along with a question,
    and returns the parsed JSON response from the API.
    """
    try:
#         print(f"[INFO] Attempting connect api...", flush=True)
# #         print(f"[INFO] SSH Key Path: {SSH_KEY_PATH}", flush=True)
#
#         api_url = f"{API_URL}{API_ENDPOINT}"  # **Use 127.0.0.1**
#         print(f"[SUCCESS] Tunnel established. Using API URL: {api_url}", flush=True)
#
#         # Send the image to the API.
#         with open(image_path, "rb") as img:
#             files = {"file": img}
#             response = requests.post(api_url, files=files, timeout=200)
#
#         print(f"[DEBUG] API Response Status Code: {response.status_code}", flush=True)
#         print(f"[DEBUG] API Response Content: {response.text[:500]}", flush=True)  # Trim output for debugging
#
#         return response.json()
        client = OpenAI(
            api_key=AI_API_KEY,
        )
        
        with open(image_path, "rb") as f:
            image = base64.b64encode(f.read()).decode("utf-8")

        print('sending api request')
        print(AI_MODEL)
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": '''Analyze the conditions of the following components of the power distribution infrastructure.

                **You MUST follow these rules strictly:**
                - **ONLY** check for the specified failure types listed below.
                - If a failure condition is met the condition field for that component **MUST** be `"bad"`.
                - The response **MUST** be in **valid JSON format** with **no additional text**.

                **Components to identify:**
                - **Pole(s)** → Vertical wooden structure(s) supporting electrical equipment.
                    - Focus on poles directly related to the equipment in the foreground.
                - **Crossarm(s)** → Horizontal wooden or fiberglass support structures mounted on the pole.
                    - Each crossarm is counted separately, even if two are mounted in parallel.
                    - Crossarms may be center mounted, meaning that the pole bisects the crossarm
                    - Crossarms may be offset mounted, meaning that the crossarm extends from only one side of the pole.
                - **Transformer(s)** → Cylindrical or box-like component(s) mounted on the pole that regulate voltage.
                - **Primary Wires** → High-voltage power lines mounted **to crossarms via insulators**.
                    - **Primary wires are THICKER than neutral wires** and are **always mounted on crossarms IF** crossarms are present.
                    - **Do NOT confuse with neutral wires, which are thinner and mounted to the pole via ceramic spool insulators.**
                - **Secondary Wires** → Lower voltage powerlines which supply power directly to customers.
                    - Typically connected to a transformer to step down voltage before service delivery **IF** a transformer is present in the image.
                    - **Often wound in a helix pattern.**
                - **Neutral Wire** → A **thin wire** that acts as the return path for electricity back to a substation.
                    - Mounted to the pole or a crossarm via a ceramic spool insulator.
                    - Connects to the ground wire which is a thin copper wire running parallel to the pole into the ground.
                - **Communication Cables** → **Thick, bundled cables** encased in **black rubber or plastic**, containing telephone, fiber optic, and cable TV lines.
                    - Communication cables are **always the LOWEST wires** on the pole if present.
                    - **They are NOT connected to transformers, insulators, or crossarms**.
                    - **If a wire is bundled and runs below secondary wires, it is a communication cable.**
                - **Guy Wires** → Diagonal steel cables that stabilize the pole.
                    - Often encased in yellow plastic at the root of the wire.
                    - Mounted to the pole and travel diagonally toward the ground.
                - **Fuse Cutouts** → Insulated switches that protect transformers and other equipment from overcurrent conditions.
                    - Consists of an insulator body and a hinge mechanism.
                    - **Rectangular in shape**.
                - **Street Lights** → Ovular or circular light fixtures mounted to the pole for road illumination.
                    - **ONLY** consider street lights mounted to the power distribution pole.
                    - **Do NOT confuse ovular or circular street lights with rectangular customer night lights.**
                - **Customer Night Lights** → Rectangular light fixtures mounted to the pole for illumination.
                    - **Do NOT confuse rectangular customer night lights with ovular street lights.**
                - **Insulators** → Ceramic or composite devices used to **separate electrical wires from the pole**.
                    - Insulators can take many shapes. They are best identified by their function, which is to mount electrical wires to poles or crossarms.
                - **Capacitors** → Box-like components mounted to the pole.
                    - Often appear in banks of three. Count these as **THREE** separate capacitors.
                    - Often mounted on the upper third of the pole.
                - **Fault Indicators** → Spherical light structures installed on primary wires to indicate a fault in distribution.
                - **Lightning Arresters** → Pointed cylindrical components mounted to the top of a transformer to protect components from surges.
                    - Often covered by an animal guard, which is a protective plastic cover to prevent wildlife tampering.
                    - The body under the animal guard is ribbed in appearance.
                    - Facilitate a connection between a **fuse cutout, secondary, or service wire** and the **transformer**.

                **Failure types to check for each component:**
                - **Pole** → Severe rot, lean of > 30 degrees, or breakage.
                - **Crossarms** → Severe rot or breakage.
                - **Transformers** → Charring, or active fire.
                - **Primary Wires** → Disconnection, or severe tangling/fraying.
                - **Secondary Wires** → Disconnection, or severe tangling/fraying.
                - **Neutral Wires** → Disconnection, or severe tangling/fraying.
                - **Communication Cables** → Disconnection, or severe tangling/fraying.
                - **Guy Wires** → Disconnection or lack of tension.
                - **Fuse Cutouts** → Disconnection.
                - **Street Lights** → Broken glass.
                - **Customer Night Lights** → Broken glass.
                - **Insulators** → Disconnection.
                - **Capacitors** → Charring.
                - **Fault Indicators** → Broken glass or bulb.
                - **Lightning Arresters** → Disconnection, or dismounted animal guard.

                **Output Format (MUST follow exactly):**
                ```json
                {
                    "component": {
                        "quantity": <integer>,  
                        "condition": "<good | bad | unknown>",
                        "description": "<string>"
                    }
                }
                ```
                '''
                        },
                
                        {
                            "type": "image_url",
                            "image_url": {"url": f'data:image/jpeg;base64,{image}'}
                        },
                    ]
                }
            ]
        )

        json_str = response.choices[0].message.content.replace("```json", '').replace('```', '').replace('\r', '').replace('\n', '')
        print('startjson' + json_str + 'endjson')
        
        json_val = json.loads(json_str)
        return json_val

    except Exception as e:
            print("[ERROR] Failed to create SSH tunnel!", flush=True)
            print(f"error SSH tunnel failure: {str(e)}")
            return {"error": f"SSH tunnel failure: {str(e)}"}

def parse_response(response):
    """
    Parses the 'response' key in the returned JSON from the API, attempting to extract valid JSON content.
    Returns the parsed JSON object or None if parsing fails.
    """
    # response_str = response.get("response", "")
    # if isinstance(response_str, list) and response_str:
    #     response_str = response_str[0]
    #
    # # Attempt to extract JSON content from response.
    # match = re.search(r"```json\s*(\{.*\})\s*```", response_str, re.DOTALL)
    # if match:
    #     json_content = match.group(1)
    # else:
    #     json_content = response_str.strip()
    #
    # try:
    #     parsed_json = json.loads(json_content)
    #     return parsed_json
    # except Exception as e:
    #     print("Error parsing JSON:", e)
    #     return None
    return response

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

        print(f"Image saved to: {os.path.abspath(file_path)}")

        thumbnail_data = create_thumbnail(image_data)

        latitude = None
        longitude = None

        # Add this to components later
        gps_data = extract_lat_long(file_path)
        if gps_data:
            latitude = gps_data.get("latitude")
            longitude = gps_data.get("longitude")

        start_api()
        llm_response = send_image(file_path)  # Send the image to the LLM API via SSH tunnel
        stop_api()
        components = parse_response(llm_response)  # Parse the response into valid JSON format

        # Convert the saved JPEG back to binary data for DB storage
        with open(file_path, "rb") as f:
            jpeg_data = f.read()

        image_id = save_image_to_db(jpeg_data, thumbnail_data, components, latitude, longitude)

        if image_id:
            return {"message": "Image uploaded successfully", "image_id": image_id}
        else:
            return {"error": "Failed to save image to database"}

    except Exception as e:
        return {"error": "Failed at Upload_image"+ str(e)}