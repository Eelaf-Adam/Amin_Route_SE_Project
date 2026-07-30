import hashlib
import logging
from sqlalchemy.orm import Session
from app import models
from app.db import engine

logger = logging.getLogger("uvicorn.error")

def seed_initial_data(db: Session):
    """
    Seeds initial hazard incident reports and demo user accounts if not present.
    """
    try:
        # Helper to construct location format depending on engine dialect
        is_pg = engine.dialect.name == 'postgresql'
        
        def make_point(lng, lat):
            if is_pg:
                from geoalchemy2.elements import WKTElement
                return WKTElement(f"POINT({lng} {lat})", srid=4326)
            return f"POINT({lng} {lat})"

        # 1. Seed Safety Incident Reports
        existing_reports_count = db.query(models.SafetyReport).count()
        if existing_reports_count == 0:
            logger.info("Seeding initial safety hazard reports into database...")
            sample_reports = [
                models.SafetyReport(
                    hazard_type="Security Checkpoint",
                    description="Military checkpoint active along North Avenue corridor. Expect delays.",
                    location=make_point(32.5410, 15.6120),
                    status="active"
                ),
                models.SafetyReport(
                    hazard_type="Road Block",
                    description="Debris obstruction blocking main avenue lane near Central District.",
                    location=make_point(32.5301, 15.5895),
                    status="active"
                ),
                models.SafetyReport(
                    hazard_type="Conflict Zone",
                    description="Active hazard zone reported near South River Bridge crossing.",
                    location=make_point(32.5200, 15.5500),
                    status="active"
                ),
                models.SafetyReport(
                    hazard_type="Flooding / Weather",
                    description="Flash flooding covering 200m segment of West Outer Highway.",
                    location=make_point(32.4900, 15.5750),
                    status="active"
                ),
                models.SafetyReport(
                    hazard_type="Infrastructure Damage",
                    description="Bridge expansion joint damage on East Main Highway.",
                    location=make_point(32.5600, 15.5800),
                    status="active"
                )
            ]
            db.add_all(sample_reports)
            logger.info(f"Successfully seeded {len(sample_reports)} initial safety hazard reports.")

        # 2. Seed Demo User Account if not present
        demo_user_exists = db.query(models.User).filter(models.User.email == "demo@aminroute.org").first()
        if not demo_user_exists:
            logger.info("Seeding demo user account...")
            demo_password_hash = hashlib.sha256("password123".encode("utf-8")).hexdigest()
            demo_user = models.User(
                name="Emergency Driver",
                email="demo@aminroute.org",
                password_hash=demo_password_hash,
                language_pref="en"
            )
            db.add(demo_user)
            logger.info("Demo user account created (Email: demo@aminroute.org / Password: password123).")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial database data: {e}")
