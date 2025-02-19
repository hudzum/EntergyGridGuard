import os
import datetime
from fastapi import FastAPI, File, UploadFile
from .database import save_image_to_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can specify specific origins, like ['http://localhost:3000']
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Directory to store images (relative to the project folder)
UPLOAD_DIR = "/app/uploads" # Found out this is saving to the container and not to the local machine. Have to figure this out.

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        print("Current working directory:", os.getcwd())

        # Read the uploaded file as binary
        image_data = await file.read()

        # Extract the file extension
        file_ext = os.path.splitext(file.filename)[1]  # png, jpeg, etc.
        timestamp = datetime.datetime.now().timestamp()
        file_path = os.path.join(UPLOAD_DIR, f"{datetime.datetime.now().timestamp()}{file_ext}")
        print(f"Saving image to: {file_path}")  # Debug print

        with open(file_path, "wb") as f:
            f.write(image_data)

        print(f"Image saved to: {os.path.abspath(file_path)}")

        image_id = save_image_to_db(image_data)

        if image_id:
            return {"message": "Image uploaded successfully", "image_id": image_id}
        else:
            return {"error": "Failed to save image to database"}

    except Exception as e:
        return {"error": str(e)}
