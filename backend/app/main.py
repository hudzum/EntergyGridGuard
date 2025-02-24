import os
import datetime
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.database import save_image_to_db  # Make sure database.py is in the same folder or in the Python path
from app.imaging import send_image, parse_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can specify specific origins, like ['http://localhost:3000']
    allow_credentials=True,
    allow_methods=["*"],    # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)

# Directory to store uploaded images (relative to the project folder)
UPLOAD_DIR = "/tmp/uploads"  # I changed this for testing used to be /app/uploads for future reference

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        print("Current working directory:", os.getcwd())

        # Read the uploaded file as binary
        image_data = await file.read()

        # Still extracts file extension but also saves the file locally for processing
        file_ext = os.path.splitext(file.filename)[1]  # e.g., .png, .jpeg
        timestamp = datetime.datetime.now().timestamp()
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}{file_ext}")
        print(f"Saving image to: {file_path}")
        with open(file_path, "wb") as f:
            f.write(image_data)
        print(f"Image saved to: {os.path.abspath(file_path)}")

        
        llm_response = send_image(file_path)    # Send the image to the LLM API via SSH tunnel
        components = parse_response(llm_response)   # Parse the response into valid JSON format
        print("Parsed Components:", components)

        # Save the original image and the parsed components to the database
        image_id = save_image_to_db(image_data, components)
        if image_id:
            return {
                "message": "Image uploaded successfully",
                "image_id": image_id,
                "components": components
            }
        else:
            return {"error": "Failed to save image to database"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
