import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, LargeBinary, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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


def save_image_to_db(image_data: bytes):
    """Saves image binary data to the database with empty 'components' and current timestamp."""
    db = next(get_db())  # Get the database session

    try:
        # Create a new Picture object (Leave components as empty for initial testing)
        picture = Picture(picture=image_data, components=json.dumps({}), time_created=datetime.now(timezone.utc))

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