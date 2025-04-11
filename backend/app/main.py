import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from .imaging import upload_image
from .database import get_image_by_id, get_db, get_image_metadata, get_thumbnail_by_id, get_image_details
from io import BytesIO

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
async def upload(file: UploadFile = File(...)):
    return await upload_image(file)


# @app.get("/api/images")
# async def fetch_images(db: Session = Depends(get_db)):
#     """Fetch all images with their metadata and Base64-encoded binary data."""
#     try:
#         images = get_images(db)
#         return JSONResponse(content={"images": images})
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"message": f"Error: {str(e)}"})


@app.get("/api/images/{image_id}")
def get_image_detail(image_id: int, db: Session = Depends(get_db)):
    """Returns FULL details of an image, including its components and actual data."""
    image_details = get_image_details(db, image_id)
    if image_details is None:
        raise HTTPException(status_code=404, detail="Image not found")

    return image_details


@app.get("/api/images/{image_id}/data")
def get_image_binary(image_id: int, db: Session = Depends(get_db)):
    """Returns ONLY the image binary data for direct access when needed."""
    image_data = get_image_by_id(db, image_id)
    if image_data is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Use StreamingResponse to send the image in binary format to the client
    return StreamingResponse(BytesIO(image_data), media_type="image/png")

@app.get("/api/images-meta")
async def fetech_images_meta(db: Session = Depends(get_db)):
    "Fetch All images with Component Data and No Encoded Images"
    try:
        images = get_image_metadata(db)
        return JSONResponse(content={"images": images})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error: {str(e)}"})

# This was a test
@app.get("/api/images/{image_id}/thumbnail")
def get_thumbnail(image_id: int, db: Session = Depends(get_db)):
    """Returns the thumbnail of the image as binary data."""
    thumbnail_data = get_thumbnail_by_id(db, image_id)
    if thumbnail_data is None:
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return StreamingResponse(BytesIO(thumbnail_data), media_type="image/jpeg")

#if __name__ == "__main__":
    #import uvicorn
    #uvicorn.run(app, host="0.0.0.0", port=8000)