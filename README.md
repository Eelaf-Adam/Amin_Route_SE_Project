# 🛡️ Amin Route — Safe Emergency Navigation System

Amin Route is an offline-first, privacy-focused navigation and incident-reporting web application engineered for emergency routing in conflict-affected or low-connectivity regions.

It combines real-time street hazard reporting, PostGIS spatial risk analysis, offline mesh tile caching, and zero-metadata telemetry to ensure user safety and anonymity.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Accessing the Live Deployed App](#accessing-the-live-deployed-app)
3. [Complete Step-by-Step Setup Guide](#complete-step-by-step-setup-guide)
   - [Option A: One-Click Cloud Deployment on Render (Blueprint)](#option-a-one-click-cloud-deployment-on-render-blueprint)
   - [Option B: Local Machine Setup (Manual Python + React)](#option-b-local-machine-setup-manual-python--react)
   - [Option C: Local Docker Setup (docker-compose)](#option-c-local-docker-setup-docker-compose)
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
   - **IndexedDB Storage (offlineDB.js)**: Stores incident reports and route history locally when operating without internet.
   - **Automatic Resync (OfflineStatus.jsx)**: Automatically synchronizes pending offline reports to the backend as soon as connectivity is restored.

3. **Zero-Metadata Privacy Protection**
   - Integrated PrivacyScrubberMiddleware strips IP addresses, User-Agent strings, and sensitive headers before request processing.

4. **Multi-Device Responsive Design**
   - Seamlessly adapts across mobile devices (ergonomic bottom navigation bar), tablets, and desktop workstations (collapsible sidebar & multi-column dashboard grid).

---

## Accessing the Live Deployed App

- **Frontend Web Application**: [https://amin-route-frontend.onrender.com](https://amin-route-frontend.onrender.com)
- **Backend API Interactive Docs**: [https://amin-route-backend.onrender.com/docs](https://amin-route-backend.onrender.com/docs)
- **Demo Credentials**:
  - **Email:** demo@aminroute.org
  - **Password:** password123

---

## Complete Step-by-Step Setup Guide

### Option A: One-Click Cloud Deployment on Render (Blueprint)

This is the easiest, automated production deployment approach using Render's graphical Infrastructure-as-Code Blueprint (
ender.yaml).

1. **Fork or Push Repository**:
   Ensure your project repository is pushed to your GitHub account (e.g. https://github.com/YOUR_USERNAME/Amin_Route_SE_Project).
2. **Open Render Dashboard**:
   - Go to [render.com](https://render.com) and log in.
   - Click **New +** in the top-right corner -> Select **Blueprint**.
3. **Connect Repository**:
   - Connect your GitHub account and select your Amin_Route_SE_Project repository.
   - Name: Amin Route | Branch: main | Blueprint Path: 
ender.yaml.
4. **Apply Blueprint**:
   - Render will automatically parse 
ender.yaml and provision all 3 required services:
     - min-route-db (PostgreSQL Database)
     - min-route-backend (FastAPI Web Service)
     - min-route-frontend (React SPA + SW PWA Static Site)
   - Click **Apply / Deploy Blueprint**.
5. **Automatic Setup**:
   - Render automatically handles database connections, PostGIS spatial extension creation, table schemas, and demo user seeding!

---

### Option B: Local Machine Setup (Manual Python + React)

Follow these exact steps to run the complete stack locally on your computer (WSL, Linux, macOS, or Windows).

#### Prerequisites
- **Python 3.10+** (with pip and env)
- **Node.js 18+** (with 
pm)
- **Git**

#### Step 1: Clone the Repository


#### Step 2: Set Up & Start Backend
1. Open terminal in the project root and navigate to ackend:
   
2. Create and activate a Python virtual environment:
   - **Linux / WSL / macOS**:
     
   - **Windows PowerShell**:
     
3. Install backend dependencies:
   
4. Start the FastAPI backend server:
   
   *The backend will automatically create SQLite database tables if PostgreSQL is not running locally. You will see:*
   INFO: Uvicorn running on http://0.0.0.0:8000

#### Step 3: Set Up & Start Frontend
1. Open a **second terminal window** and navigate to the rontend directory:
   
2. Install Node dependencies:
   
3. Start the Vite React development server:
   
4. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

---

### Option C: Local Docker Setup (docker-compose)

If you have Docker Desktop installed, you can start the entire stack (PostgreSQL + PostGIS + FastAPI + React) in isolated containers with one command.

1. Ensure Docker Desktop is running.
2. In the project root directory, run:
   
The command 'docker-compose' could not be found in this WSL 2 distro.
We recommend to activate the WSL integration in Docker Desktop settings.

For details about using Docker Desktop with WSL 2, visit:

https://docs.docker.com/go/wsl2/
3. Access your local application:
   - **Frontend App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
4. To stop the containers:
   
The command 'docker-compose' could not be found in this WSL 2 distro.
We recommend to activate the WSL integration in Docker Desktop settings.

For details about using Docker Desktop with WSL 2, visit:

https://docs.docker.com/go/wsl2/

---

## Verification & Testing Guide

### 1. Interactive API Documentation (/docs)
Open [https://amin-route-backend.onrender.com/docs](https://amin-route-backend.onrender.com/docs) (or http://localhost:8000/docs locally) to view and test all FastAPI endpoints directly in Swagger UI.

### 2. User Authentication
- Click **Sign In** on the frontend and enter demo credentials:
  - **Email:** demo@aminroute.org
  - **Password:** password123
- Or register a new account under **Sign Up** to verify password hashing and JWT token issuance.

### 3. PWA Offline Access & Airplane Mode Testing
1. Open the frontend URL in your browser or mobile device.
2. Wait a few seconds for the PWA Service Worker to initialize (Console log: ✅ ServiceWorker registered for offline support).
3. Disconnect your Wi-Fi or enable **Airplane Mode**.
4. Refresh the page: the app will open offline, render cached OpenStreetMap tiles, and allow submitting offline hazard reports that automatically resync once reconnected!

---

## Project Directory Structure



---

## Security & Privacy Guarantees

- **Zero IP or Telemetry Logging**: Request middleware strips IP addresses and User-Agent headers at the gateway boundary.
- **Salted Password Hashing**: Hashed using industry-standard bcrypt algorithm.
- **JWT Authorization**: Stateless authorization via signed HTTP Bearer tokens.
- **Data Autonomy**: Users can manage or delete their account data and route logs at any time.
