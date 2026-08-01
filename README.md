# Amin Route — Safe Emergency Navigation System

Amin Route is an offline-first, privacy-focused navigation and incident-reporting web application engineered for emergency routing in conflict-affected or low-connectivity regions.

It combines real-time street hazard reporting, PostGIS spatial risk analysis, offline tile caching, and zero-metadata telemetry to ensure user safety and anonymity.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Accessing the Live Deployed App](#accessing-the-live-deployed-app)
3. [Setup Guide](#setup-guide)
   - [Option A: Local Machine Setup (Manual Python + React)](#option-a-local-machine-setup-manual-python--react)
   - [Option B: Local Docker Setup (docker-compose)](#option-b-local-docker-setup-docker-compose)
4. [Verification & Testing Guide](#verification--testing-guide)
5. [Project Directory Structure](#project-directory-structure)
6. [Security & Privacy Guarantees](#security--privacy-guarantees)

---

## Key Features

1. **Conflict-Free Safe Routing**
   - Calculates safest vs. fastest navigation paths by cross-checking OpenStreetMap directions against active crowdsourced and PostGIS hazard zones.
   - Interactive turn-by-turn navigation with live progress telemetry and safety clearance badges.

2. **Offline-First & Progressive Web App (PWA)**
   - **Service Worker Tile Caching (sw.js)**: Caches OpenStreetMap tiles and app shell assets for offline mapping.
   - **IndexedDB Storage (offlineDB.js)**: Stores incident reports and route history locally when operating without internet connection.
   - **Automatic Resync (OfflineStatus.jsx)**: Automatically synchronizes pending offline reports to the backend once connectivity is restored.

3. **Zero-Metadata Privacy Protection**
   - Integrated PrivacyScrubberMiddleware strips IP addresses, User-Agent strings, and sensitive headers before request processing.

4. **Multi-Device Responsive Design**
   - Adapts across mobile devices (bottom navigation bar), tablets, and desktop workstations (collapsible sidebar & multi-column dashboard grid).

---

## Accessing the Live Deployed App

- **Frontend Web Application**: [https://amin-route-frontend.onrender.com](https://amin-route-frontend.onrender.com)
- **Backend API Interactive Docs**: [https://amin-route-backend.onrender.com/docs](https://amin-route-backend.onrender.com/docs)
- **Demo Credentials**:
  - **Email:** demo@aminroute.org
  - **Password:** password123

---

## Setup Guide

### Option A: Local Machine Setup (Manual Python + React)

Follow these steps to run the backend and frontend locally on your machine.

#### Prerequisites
- **Python 3.10+** (with pip and venv)
- **Node.js 18+** (with npm)
- **Git**

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Eelaf-Adam/Amin_Route_SE_Project.git
cd Amin_Route_SE_Project
```

#### Step 2: Set Up & Start Backend
1. Open a terminal window in the project root and navigate to the backend directory:
```bash
cd backend
```
2. Create and activate a Python virtual environment:
   - **Linux / WSL / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows PowerShell**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
3. Install backend dependencies:
```bash
pip install -r requirements.txt
```
4. Start the FastAPI backend server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend server will run at `http://localhost:8000`.

#### Step 3: Set Up & Start Frontend
1. Open a second terminal window and navigate to the frontend directory:
```bash
cd frontend
```
2. Install Node dependencies:
```bash
npm install
```
3. Start the Vite React development server:
```bash
npm run dev
```
4. Open your browser and navigate to:
`http://localhost:5173`

---

### Option B: Local Docker Setup (docker-compose)

If Docker Desktop is installed on your machine, you can launch the complete stack with Docker Compose.

1. In the project root directory, run:
```bash
docker-compose up --build
```
2. Access the local services:
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:8000`
   - **API Documentation**: `http://localhost:8000/docs`
3. To stop the containers:
```bash
docker-compose down
```

---

## Verification & Testing Guide

### 1. Interactive API Documentation (/docs)
Open `http://localhost:8000/docs` (or the live backend docs URL) to test all FastAPI endpoints directly in Swagger UI.

### 2. User Authentication
- Click **Sign In** on the frontend and enter demo credentials (`demo@aminroute.org` / `password123`).
- Or register a new account under **Sign Up** to verify password hashing and JWT token issuance.

### 3. Offline Access & Resync Testing
1. Open the frontend in your browser.
2. Allow the PWA Service Worker to initialize.
3. Disconnect network connectivity or enable Airplane mode.
4. Refresh the page to verify offline mapping tiles and local incident report saving in IndexedDB.
5. Re-enable network connectivity to verify automatic syncing of pending reports.

---

## Project Directory Structure

```
Amin_Route_SE_Project/
├── backend/
│   ├── app/
│   │   ├── proxy/
│   │   │   └── routing.py          # OpenStreetMap safe routing & risk interceptor
│   │   ├── routes/
│   │   │   ├── auth.py             # User registration & authentication routes
│   │   │   └── reports.py          # Incident reports API routes
│   │   ├── utils/
│   │   │   └── privacy.py          # Zero-metadata privacy scrubber middleware
│   │   ├── db.py                   # Database connection engine (PostgreSQL / SQLite)
│   │   ├── main.py                 # FastAPI application entrypoint & CORS middleware
│   │   ├── models.py               # SQLAlchemy ORM database models
│   │   └── seed.py                 # Seed initial data and demo user
│   ├── check_users.py              # CLI utility to inspect user database records
│   ├── check_users.sql             # SQL query helper script
│   ├── Dockerfile                  # Backend Docker container definition
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json           # PWA web app manifest
│   │   └── sw.js                   # Service Worker tile caching
│   ├── src/
│   │   ├── components/             # React UI components (Auth, Map, RoutePlanner, Reports, SOS, History)
│   │   ├── utils/
│   │   │   └── offlineDB.js        # IndexedDB client-side database helper
│   │   ├── App.jsx                 # Main layout & navigation container
│   │   ├── App.css                 # Application custom styles
│   │   ├── index.css               # Global Tailwind CSS imports
│   │   └── main.jsx                # React application root entrypoint
│   ├── Dockerfile                  # Frontend Docker container definition
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # HTML entrypoint
│   ├── nginx.conf                  # Nginx production configuration
│   ├── package.json                # Frontend package dependencies & scripts
│   ├── postcss.config.js           # PostCSS setup for Tailwind CSS
│   ├── tailwind.config.js          # Tailwind CSS theme configuration
│   └── vite.config.cjs             # Vite build configuration
│
├── render.yaml                     # Infrastructure configuration
├── docker-compose.yml              # Docker Compose multi-container configuration
├── start.sh / start.bat            # Environment startup scripts
├── .gitignore                      # Git exclusion rules
└── README.md                       # Documentation
```

---

## Security & Privacy Guarantees

- **Zero IP or Telemetry Logging**: Request middleware strips IP addresses and User-Agent headers at the gateway boundary.
- **Salted Password Hashing**: Passwords hashed using bcrypt and SHA-256 fallback.
- **JWT Authorization**: Stateless authorization via signed HTTP Bearer tokens.
- **Data Autonomy**: Users can manage or delete their account data and route logs at any time.
