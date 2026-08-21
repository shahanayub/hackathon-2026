# SkillForge

PS-03 — Looplearn Hackathon 2026

An AI-powered platform that looks at a student's current skills and target
career role, and gives them a roadmap of what to learn next.

**Live App:** https://hackathon-2026-roan-eight.vercel.app

## Problem

Students often want to get into tech but don't know what skills they're
missing or what to learn next. SkillForge takes their current skills + target
role, scores how ready they are, and generates a roadmap using AI.

## What it does

- Sign up / log in
- Add your current skills and set a target role (e.g. AI Engineer, Full Stack Dev, DevOps)
- Get a readiness score and list of skill gaps
- Get an AI-generated roadmap (phases + learning resources) for those gaps
- Save your roadmaps and view them later
- User profile stored in MongoDB with a role field (student/mentor/admin)

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **AI Service:** Python + FastAPI + Gemini API
- **Analyzer Service:** Python + FastAPI (OOP skill scoring logic)
- **Auth:** Supabase
- **Deployment:** Vercel (frontend), Render (backend + AI service + analyzer)

## How it's structured

```
frontend  →  backend (API gateway + MongoDB)  →  ai-service (Gemini + agent)  →  python-service (skill scoring)
```

Four separate services, each in its own folder, each with its own Dockerfile.

## AI part

- **Generative AI:** ai-service calls Gemini to write the actual roadmap text.
- **Knowledge base:** `career_guides.json` has learning paths for 3 roles that the agent pulls from before answering.
- **Agent:** `career_agent.py` has 2 tools — one that calls the Python service to get scores/gaps, one that looks up resources from the knowledge base. It combines both into one response.
- **Python/OOP:** `SkillAnalyzer` class does the scoring — `calculate_score()`, `identify_gaps()`, `recommend_topics()`.

## Running it locally

```bash
git clone https://github.com/shahanayub/hackathon-2026.git
cd hackathon-2026
docker-compose up --build
```

You'll need a `.env` file with your own `MONGO_URI` and `GEMINI_API_KEY`.

Or run each service manually:

```bash
# python-service
cd python-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# ai-service
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8001

# backend
cd backend && npm install && npm start

# frontend
cd frontend && npm install && npm run dev
```

## Env variables needed

- `MONGO_URI` (backend)
- `GEMINI_API_KEY` (ai-service)
- `PYTHON_SERVICE_URL` (ai-service, backend)
- `AI_SERVICE_URL` (backend)
- `VITE_API_URL` (frontend)


## Author

Shahan Ayub — 2nd semester Software Engineering, COMSATS Wah
