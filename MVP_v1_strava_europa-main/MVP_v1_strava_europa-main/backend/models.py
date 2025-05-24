from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime
#from db import Base  # au lieu de declarative_base()


Base = declarative_base()

class Activity(Base):
    __tablename__ = "activities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    type = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    geometry = Column(Geometry("LINESTRING"))

class ActivityCreate(BaseModel):
    user_id: str
    type: str
    date: datetime
    geometry: str  # WKT format (ou GeoJSON si tu veux adapter)
