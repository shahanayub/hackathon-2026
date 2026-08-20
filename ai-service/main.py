import os
import sys
import json
import traceback
from fastapi import FastAPI, HTTPException, Request
import requests
from google import genai
from google.genai import types

app = FastAPI(title="SkillForge AI Service")

PYTHON_SERVICE_URL = os.getenv("PYTHON_SERVICE_URL", "http://skillforge-python:8000")

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-service"}

@app.post("/agent/recommend")
@app.post("/api/ai/generate-roadmap")
async def generate_roadmap(request: Request):
    try:
        body = await request.json()
        
        target_role = body.get("target_role") or body.get("role") or body.get("targetRole") or "Full Stack Developer"
        current_skills = body.get("current_skills") or body.get("skills") or body.get("user_skills") or []
        user_query = body.get("user_query") or body.get("query") or body.get("goal") or "How do I land a job in this field?"

        # 1. Query Python Skill Engine
        skill_gaps = []
        score = 0.0
        try:
            gap_resp = requests.post(
                f"{PYTHON_SERVICE_URL}/analyze",
                json={"target_role": target_role, "current_skills": current_skills},
                timeout=5
            )
            if gap_resp.status_code == 200:
                gap_data = gap_resp.json()
                skill_gaps = gap_data.get("missing_gaps") or gap_data.get("missing_skills", [])
                score = gap_data.get("readiness_score") or gap_data.get("score", 0.0)
        except Exception as py_err:
            print(f"[WARN] Python Service call failed: {py_err}", flush=True)

        # 2. Extract Gemini API Key
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            print("[ERROR] GEMINI_API_KEY environment variable is missing!", flush=True)
            raise ValueError("GEMINI_API_KEY is not set.")

        # 3. Call Gemini Model
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an expert technical mentor and career architect.
Target Role: {target_role}
Current Skills: {', '.join(current_skills) if current_skills else 'None'}
Skill Gaps to Bridge: {', '.join(skill_gaps) if skill_gaps else 'None'}
User Goal/Query: "{user_query}"

Generate a structured roadmap with actionable milestones and curated learning resources.
Return strictly a valid JSON object matching this schema:
{{
  "action_plan": [
    "Phase 1: Concise milestone description...",
    "Phase 2: Concise milestone description...",
    "Phase 3: Concise milestone description...",
    "Phase 4: Concise milestone description..."
  ],
  "curated_resources": [
    "Resource 1: Title and Documentation Link",
    "Resource 2: Title and Documentation Link",
    "Resource 3: Title and Documentation Link",
    "Resource 4: Title and Documentation Link"
  ]
}}
"""

        response = None
        for model_name in ['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash']:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                if response and response.text:
                    print(f"[INFO] Successfully generated using model: {model_name}", flush=True)
                    break
            except Exception as model_err:
                print(f"[WARN] Model {model_name} failed: {model_err}", flush=True)

        if not response or not response.text:
            raise RuntimeError("Empty response received from Gemini API.")

        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]

        ai_output = json.loads(raw_text.strip())

        return {
            "score": score,
            "skill_gaps": skill_gaps,
            "action_plan": ai_output.get("action_plan", []),
            "curated_resources": ai_output.get("curated_resources", [])
        }

    except Exception as e:
        print("[CRITICAL] AI Service exception:", flush=True)
        traceback.print_exc(file=sys.stdout)
        
        fallback_gaps = skill_gaps if skill_gaps else ["Core Architecture", "Production Deployment"]
        return {
            "score": score if score else 50.0,
            "skill_gaps": fallback_gaps,
            "action_plan": [
                f"Phase 1: Bridge Immediate Gaps ({', '.join(fallback_gaps[:2])}) with targeted tutorials.",
                f"Phase 2: Build a production-grade capstone project for {target_role}.",
                "Phase 3: Implement automated CI/CD workflows and containerized microservices.",
                "Phase 4: Conduct technical interview prep and finalize portfolio showcase."
            ],
            "curated_resources": [
                f"Official Developer Docs for {target_role}",
                "System Design Primer (GitHub)",
                "Full Stack Open Curriculum",
                "NeetCode Technical Interview Patterns"
            ]
        }