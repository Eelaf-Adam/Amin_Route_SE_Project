import sys
import os
import logging
from urllib.parse import quote_plus, urlsplit, urlunsplit
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base

# Ensures access to the parent backend folder 
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Load environment variables strictly from backend/.env
try:
    from dotenv import load_dotenv
    env_file = os.path.join(BASE_DIR, '.env')
    if os.path.exists(env_file):
        load_dotenv(dotenv_path=env_file)
    else:
        load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("uvicorn.error")

# PostgreSQL connection parameters read strictly from environment with clean fallbacks
DB_USER = os.getenv("POSTGRES_USER") or "postgres"
DB_PASS = os.getenv("POSTGRES_PASSWORD") or "secure_password_2026"
DB_HOST = os.getenv("POSTGRES_HOST") or "localhost"
DB_PORT = os.getenv("POSTGRES_PORT") or "5432"
DB_NAME = os.getenv("POSTGRES_DB") or "amin_route_db"

# Build URL safely from environment variables
if DB_PASS:
    DEFAULT_PG_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASS)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DEFAULT_PG_URL = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

DATABASE_URL = os.getenv("DATABASE_URL") or DEFAULT_PG_URL

def format_postgres_url(url):
    try:
        if "postgresql://" in url and "@" in url:
            parts = urlsplit(url)
            if parts.username and parts.password:
                encoded_pwd = quote_plus(parts.password)
                user_pass = f"{parts.username}:{encoded_pwd}"
                netloc = f"{user_pass}@{parts.hostname}"
                if parts.port:
                    netloc += f":{parts.port}"
                return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))
    except Exception:
        pass
    return url

FINAL_DATABASE_URL = format_postgres_url(DATABASE_URL)

def create_resilient_engine():
    """Tries PostgreSQL connection first. If unreachable or auth fails, falls back gracefully to SQLite."""
    try:
        logger.info(f"Attempting connection to PostgreSQL engine...")
        pg_engine = create_engine(FINAL_DATABASE_URL, pool_pre_ping=True)
        with pg_engine.connect() as conn:
            pass
        logger.info("Successfully connected to PostgreSQL engine.")
        return pg_engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection offline or auth notice ({e}). Falling back to local SQLite engine.")
        sqlite_path = os.path.join(BASE_DIR, "amin_route.db")
        sqlite_url = f"sqlite:///{sqlite_path}"
        sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        return sqlite_engine

engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def build_tables():
    from app import models
    Base.metadata.create_all(bind=engine)
    existing_tables = inspect(engine).get_table_names()
    logger.info(f"Database tables successfully verified: {existing_tables}")

def init_db():
    build_tables()

if __name__ == "__main__":
    print("Initializing resilient database tables...")
    build_tables()
    print("Database tables initialized successfully.")