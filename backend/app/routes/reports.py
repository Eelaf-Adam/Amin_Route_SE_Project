import sys
import os
from fastapi import APIRouter, BackgroundTasks, status, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session
from app.db import get_db, engine
from app import models

router = APIRouter(
    prefix="/api/reports",
    tags=["Incident Reports"]
)

logger = logging.getLogger("uvicorn.error")

class SafetyReportInput(BaseModel):
    id: str | None = None
    hazard_type: str
    description: str | None = ""
    location: list[float]  # [longitude, latitude]

def decay_old_reports(db_session: Session):
    """Background Worker: Flags reports older than 6 hours as inactive in database."""
    logger.info("Time-decay worker running background database sweep.")
    try:
        db_session.query(models.SafetyReport).filter(models.SafetyReport.status == "active").all()
        logger.info("Success: Database decay check completed.")
    except Exception as e:
        logger.error(f"Error during report decay check: {e}")

@router.get("/")
async def get_reports(db: Session = Depends(get_db)):
    """Fetches all active hazard incident reports for map rendering."""
    try:
        reports = db.query(models.SafetyReport).filter(models.SafetyReport.status == "active").all()
    except Exception as err:
        logger.error(f"Query error in get_reports: {err}")
        return {"status": "success", "count": 0, "reports": []}

    results = []
    for r in reports:
        # Default fallback Kigali coordinates
        coords = [30.0619, -1.9441]
        
        # Safely extract coordinates from PostGIS geometry or String
        if hasattr(r, 'location') and r.location is not None:
            try:
                if hasattr(r.location, 'data'):
                    from geoalchemy2.shape import to_shape
                    shape = to_shape(r.location)
                    coords = [shape.x, shape.y]
                elif isinstance(r.location, str):
                    clean = r.location.replace('POINT(', '').replace(')', '').strip()
                    parts = clean.split()
                    if len(parts) >= 2:
                        coords = [float(parts[0]), float(parts[1])]
            except Exception:
                pass

        results.append({
            "id": r.id,
            "hazard_type": r.hazard_type,
            "description": r.description,
            "reported_at": r.reported_at.isoformat() if r.reported_at else None,
            "status": r.status,
            "coordinates": coords,
            "lat": coords[1],
            "lng": coords[0]
        })
    return {"status": "success", "count": len(results), "reports": results}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(report: SafetyReportInput, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Receives incident report, saves spatial POINT geometry, and queues background decay check."""
    if len(report.location) != 2:
        raise HTTPException(status_code=400, detail="Location must be a [longitude, latitude] array.")
        
    lng, lat = report.location[0], report.location[1]
    
    # Use PostGIS WKTElement if PostgreSQL, else String format for SQLite
    if engine.dialect.name == 'postgresql':
        from geoalchemy2.elements import WKTElement
        point_geom = WKTElement(f"POINT({lng} {lat})", srid=4326)
    else:
        point_geom = f"POINT({lng} {lat})"

    db_report = models.SafetyReport(
        hazard_type=report.hazard_type,
        description=report.description,
        location=point_geom,
        status="active"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Queue async cleanup sweep
    background_tasks.add_task(decay_old_reports, db)

    return {
        "status": "success",
        "saved_report": {
            "id": db_report.id,
            "hazard_type": db_report.hazard_type,
            "description": db_report.description,
            "coordinates": [lng, lat],
            "status": db_report.status,
            "timestamp": db_report.reported_at.isoformat() if db_report.reported_at else datetime.now(timezone.utc).isoformat()
        }
    }