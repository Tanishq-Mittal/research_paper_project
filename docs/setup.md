# Local Setup & Installation Guide

## Prerequisites
* **Python:** 3.10+ (Tested on Python 3.13)
* **Node.js:** v18+ (Tested on Node v22.17)
* **npm:** v9+

---

## Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure environment variables in backend/.env
# Copy .env.example to .env
```

---

## Step 2: Run Backend Server

```bash
# Start FastAPI backend (port 8000)
python -m uvicorn app.main:app --reload --port 8000
```
Backend will automatically initialize the database schema and seed the foundational demo papers (Attention is All You Need, LoRA, ResNet) on first run!

---

## Step 3: Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Step 4: Run Tests

```bash
# In backend directory with virtual environment active:
python -m pytest ..\tests -v
```
