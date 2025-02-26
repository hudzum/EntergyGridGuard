import base64
import os
from dotenv import load_dotenv, find_dotenv
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, LargeBinary, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

load_dotenv(find_dotenv())

DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Table can be edited here if new data is needed
class Picture(Base):
    __tablename__ = "pictures"

    id = Column(Integer, primary_key=True, index=True)
    picture = Column(LargeBinary)
    components = Column(JSON, default={})
    time_created = Column(DateTime, default=datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_image_to_db(image_data: bytes, components: dict = None):
    """Saves image binary data to the database with empty 'components' and current timestamp."""
    db = next(get_db())  # Get the database session
    if components is None:
        components = {}
    try:
        # Create a new Picture object (Leave components as empty for initial testing)
        picture = Picture(
            picture=image_data,
            components=components,
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

# Does not have a use yet
def get_image_metadata(db: Session):
    """Fetch only ID and time_created for all images."""
    images = db.query(Picture.id, Picture.time_created).all()
    return [{"id": pic.id, "time_created": pic.time_created.isoformat()} for pic in images]

def get_image_details(db: Session, image_id: int):
    """Fetch all details of a single image except binary data."""
    image = db.query(Picture).filter(Picture.id == image_id).first()
    if image:
        return {
            "id": image.id,
            "components": image.components,
            "time_created": image.time_created.isoformat()
        }
    return None

def get_image_by_id(db: Session, image_id: int):
    """Fetch the image binary data by its ID."""
    image = db.query(Picture).filter(Picture.id == image_id).first()
    if image:
        return image.picture
    return None

def get_images(db: Session):
    """Fetch all images along with their metadata and encode binary data to Base64."""
    pictures = db.query(Picture).all()

    images = []
    for picture in pictures:
        # Base64 encode the binary image data
        encoded_image = base64.b64encode(picture.picture).decode("utf-8")
        images.append({
            "id": picture.id,
            "time_created": picture.time_created.isoformat(),
            "image": encoded_image  # Base64 encoded image
        })

    return images
