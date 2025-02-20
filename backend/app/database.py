import os
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, LargeBinary, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

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

def save_image_to_db(image_data: bytes, components: dict = None):
    """
    Saves image binary data and associated components to the database.
    Returns the inserted record's ID, or None if an error occurs.
    """
    db = next(get_db())
    if components is None:
        components = {}
    try:
        picture = Picture(
            picture=image_data,
            components=components,
            time_created=datetime.now(timezone.utc)
        )
        db.add(picture)
        db.commit()
        db.refresh(picture)
        return picture.id
    except Exception as e:
        db.rollback()
        print("Database Error:", e)
        return None
