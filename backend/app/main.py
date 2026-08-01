import sys
import os
from contextlib import asynccontextmanager

# Ensure parent backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.privacy import PrivacyScrubberMiddleware
from app.routes import auth, reports
from app.proxy import routing
from app.db import init_db, SessionLocal
from app.seed import seed_initial_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed demo data on startup
    try:
        init_db()
        db = SessionLocal()
        try:
            seed_initial_data(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Startup DB notice: {e}")
    yield

app = FastAPI(
    title="Amin Route API",
    description="Secure, metadata-scrubbed backend services for offline-first emergency navigation routing.",
    version="1.0.0",
    lifespan=lifespan
)

# Apply privacy scrubbing middleware
app.add_middleware(PrivacyScrubberMiddleware)

# Configure CORS middleware
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth.router)
app.include_router(reports.router)  
app.include_router(routing.router)

# System health check endpoint
@app.get("/", tags=["System Health"])
def root_health_check():
    return {
        "status": "operational",
        "system": "Amin Route Cloud Engine",
        "privacy_layer": "active"
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)