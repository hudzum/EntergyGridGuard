import base64
import os
from dotenv import load_dotenv, find_dotenv
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, LargeBinary, DateTime, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

load_dotenv(find_dotenv())

host = os.getenv("PGHOST")
user = os.getenv("PGUSER")
port = os.getenv("PGPORT")
dbname = os.getenv("PGDATABASE")
password = os.getenv("PGPASSWORD")

DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Define picture model
class Picture(Base):
    __tablename__ = "pictures"

    id = Column(Integer, primary_key=True, index=True)
    picture = Column(LargeBinary)
    thumbnail = Column(LargeBinary)
    components = Column(JSON, default={})
    time_created = Column(DateTime, default=datetime.now(timezone.utc))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

Base.metadata.create_all(bind=engine)


# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to save an image to the database with its components
def save_image_to_db(image_data: bytes, thumbnail_data: bytes, components: dict = None, latitude_data: float = None, longitude_data: float = None):
    """Saves image binary data to the database with empty 'components' and current timestamp."""
    db = next(get_db())  # Get the database session
    if components is None:
        components = {}

    try:
        # Create a new Picture object (Leave components as empty for initial testing)
        picture = Picture(
            picture=image_data,
            thumbnail=thumbnail_data,
            components=components,
            latitude=latitude_data,
            longitude=longitude_data,
            time_created=datetime.now(timezone.utc)
        )

        # Add the new object to the session
        db.add(picture)

        # Commit the transaction and return the id
        db.commit()
        db.refresh(picture)

        return picture.id

    except Exception as e:
        db.rollback()
        print("Database Error:", e)
        return None

# Used for Query Page
def get_image_metadata(db: Session):
    """Fetch all images with just their metadata, excluding the binary data."""
    print("Starting metadata-only database query")
    
    # Query only the fields you need, excluding the full picture binary data
    pictures = db.query(
        Picture.id,
        Picture.time_created,
        Picture.components,
        Picture.thumbnail,
        Picture.longitude,
        Picture.latitude,
    ).all()
        
    images = []
    for picture in pictures:
        encoded_thumbnail = None
        if picture.thumbnail:
            encoded_thumbnail = base64.b64encode(picture.thumbnail).decode("utf-8")

        images.append({
            "id": picture.id,
            "time_created": picture.time_created.isoformat(),
            "components": picture.components,
            "thumbnail": encoded_thumbnail,
            "latitude": picture.latitude,
            "longitude": picture.longitude,
        })
    return images

def get_image_by_id(db: Session, image_id: int):
    """Fetch the image binary data by its ID."""
    image = db.query(Picture).filter(Picture.id == image_id).first()
    if image:
        return image.picture
    return None

def get_thumbnail_by_id(db: Session, image_id: int):
    """Fetch the thumbnail binary data by its ID and return it as Base64 encoded."""
    image = db.query(Picture).filter(Picture.id == image_id).first()
    if image and image.thumbnail:
        # Base64 encode the thumbnail binary data
        encoded_thumbnail = base64.b64encode(image.thumbnail).decode("utf-8")
        return {
            "id": image.id,
            "thumbnail": encoded_thumbnail  # Base64 encoded thumbnail
        }
    return None

# def get_images(db: Session):
#     """Fetch all images along with their metadata and encode binary data to Base64."""
#     print("Starting database query")
#     pictures = db.query(Picture).all()
#     print(f"Query Completed, found {len(pictures)} pictures")
#
#     if not pictures:
#         print("No pictures found in database")
#         return []
#
#     images = []
#     for picture in pictures:
#         print(f"Processing picture ID: {picture.id}")
#         # Base64 encode the binary image data
#         encoded_image = base64.b64encode(picture.picture).decode("utf-8")
#         images.append({
#             "id": picture.id,
#             "time_created": picture.time_created.isoformat(),
#             "image": encoded_image  # Base64 encoded image
#         })
#
#     return images
