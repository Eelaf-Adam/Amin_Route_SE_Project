import sys
import os
from datetime import datetime, timezone
import uuid 
from sqlalchemy import Column, String, Text, DateTime, Float
from geoalchemy2 import Geometry
from app.db import Base, engine

# Ensures access to parent backend directory when running models.py directly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    language_pref = Column(String(2), default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hazard_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(
        Geometry(geometry_type='POINT', srid=4326) if engine.dialect.name == 'postgresql' else Text, 
        nullable=True
    )
    reported_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(20), default="active")


class RouteHistory(Base):
    __tablename__ = "route_histories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    start_name = Column(String(255), nullable=False)
    dest_name = Column(String(255), nullable=False)
    path_geometry = Column(
        Geometry(geometry_type='LINESTRING', srid=4326) if engine.dialect.name == 'postgresql' else Text, 
        nullable=True
    )
    safety_rating = Column(Float, default=1.0)
    cached_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
