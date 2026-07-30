# Amin Route — Safe Emergency Navigation System

Amin Route is an offline-first, privacy-focused navigation and incident-reporting web application engineered for emergency routing in conflict-affected or low-connectivity regions.

It combines real-time street hazard reporting, PostGIS spatial risk analysis, offline mesh tile caching, and zero-metadata telemetry to ensure user safety and anonymity.

---

## Key Features

1. **Conflict-Free Safe Routing**
   - Calculates safest vs. fastest navigation paths by cross-checking OpenStreetMap directions against active crowdsourced and PostGIS hazard zones.
   - Interactive turn-by-turn navigation with live progress telemetry and safety clearance badges.

2. **Offline-First & Progressive Web App (PWA)**
   - **Service Worker Tile Caching (`sw.js`)**: Caches OpenStreetMap tiles and app shell assets for offline mapping.
   - **IndexedDB Storage (`offlineDB.js`)**: Stores incident reports and route history locally when operating without internet.
   - **Automatic Resync (`OfflineStatus.jsx`)**: Automatically synchronizes pending offline reports to the backend as soon as connectivity is restored.

3. **Zero-Metadata Privacy Protection**
   - Integrated `PrivacyScrubberMiddleware` strips IP addresses, User-Agent strings, and sensitive headers before request processing.

4. **Multi-Device Responsive Design**
   - Seamlessly adapts across mobile devices (ergonomic bottom navigation bar), tablets, and desktop workstations (collapsible sidebar & multi-column dashboard grid).

---

## Cloud Deployment Guide (Vercel + Render)

### 1. Backend Deployment on Render (FastAPI)

1. **Connect Repository to Render**:
   - Go to Render Dashboard -> Click **New +** -> Select **Web Service**.
   - Connect your GitHub repository (`Amin_Route_SE_Project`).
2. **Configure Service Settings**:
   - **Name**: `amin-route-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables on Render**:
   Add the following in Render's **Environment** tab:
   - `APP_ENV`: `production`
   - `SECRET_KEY`: *(Generate a secure random string)*
   - `ALLOWED_ORIGINS`: `https://your-app-name.vercel.app` *(Your Vercel frontend URL)*
   - `DATABASE_URL`: *(Your PostgreSQL connection string on Render / Neon / Supabase)*
4. **Deploy**:
   - Click **Create Web Service**. Render will build and deploy your backend.
   - Copy your deployed backend URL (e.g. `https://amin-route-backend.onrender.com`).

---

### 2. Frontend Deployment on Vercel (React + Vite)

1. **Import Repository to Vercel**:
   - Go to Vercel Dashboard -> Import `Amin_Route_SE_Project`.
2. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
3. **Set Environment Variables on Vercel**:
   - `VITE_API_BASE_URL`: `https://amin-route-backend.onrender.com` *(Your Render backend URL)*
4. **Deploy**:
   - Click **Deploy**. Vercel uses `frontend/vercel.json` to handle SPA routing automatically.
   - Your frontend live site will be generated (e.g. `https://amin-route.vercel.app`).

---

## Project Directory Structure

```text
Amin_Route_SE_Project/
├── backend/
│   ├── app/
│   │   ├── proxy/routing.py        # OpenStreetMap safe routing & risk interceptor
│   │   ├── routes/                # Auth & Incident Reports API routes
│   │   ├── utils/privacy.py        # Zero-metadata privacy scrubber middleware
│   │   ├── db.py                 # Database engine & automatic table creation
│   │   ├── main.py               # FastAPI application entrypoint & CORS config
│   │   └── models.py             # SQLAlchemy ORM models
│   ├── .env                      # Local backend environment variables (git-ignored)
│   ├── Dockerfile                # Backend container definition
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── public/sw.js              # PWA Service Worker (Cache-First tiles & assets)
│   ├── src/
│   │   ├── components/           # Auth, Emergency SOS, Map, RoutePlanner, OfflineStatus
│   │   ├── utils/offlineDB.js     # IndexedDB helper module
│   │   ├── App.jsx               # Responsive App layout & desktop sidebar
│   │   └── main.jsx              # Service Worker registration & React root
│   ├── vercel.json               # Vercel Single Page App rewrite config
│   ├── .env                      # Local frontend environment variables (git-ignored)
│   └── package.json              # Dependencies & build scripts
│
├── render.yaml                   # Render Blueprint infrastructure definition
├── docker-compose.yml            # Multi-container local/VPS docker configuration
├── start.sh / start.bat          # Startup scripts
├── .gitignore                    # Git security & exclusion rules
└── README.md                     # Documentation
```

---

## Local Quick Start Guide

### 1. Backend Setup
```bash
cd backend
source myvenv/bin/activate
pip install -r requirements.txt
python3 -m app.main
```
*Backend API Docs available at:* `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend App available at:* `http://localhost:5173`

---

## License & Privacy Assurance

Designed with zero data-retention principles for humanitarian emergency navigation.