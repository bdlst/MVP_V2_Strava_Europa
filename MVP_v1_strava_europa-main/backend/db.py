from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from models import Activity, Base
from dotenv import load_dotenv
import os

load_dotenv()

#Base = declarative_base()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

def create_activity(db, activity_data):
    new = Activity(
        user_id=activity_data.user_id,
        type=activity_data.type,
        date=activity_data.date,
        geometry=f"SRID=4326;{activity_data.geometry}"
    )
    db.add(new)
    db.commit()
