from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from analyzer import SkillAnalyzer

app = FastAPI(title="SkillForge Python Service")

class SkillRequest(BaseModel):
    current_skills: Optional[List[str]] = []
    user_skills: Optional[List[str]] = None
    target_role: str

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python Skill Analyzer"}

@app.post("/analyze")
@app.post("/skills/analyze")
@app.post("/api/skills/analyze")
def analyze_skills(data: SkillRequest):
    skills = data.user_skills if data.user_skills is not None else data.current_skills
    analyzer = SkillAnalyzer(
        current_skills=skills,
        target_role=data.target_role
    )
    
    score = analyzer.calculate_score()
    gaps = analyzer.identify_gaps()
    recs = analyzer.recommend_topics()

    return {
        "readiness_score": score,
        "score": score,
        "missing_gaps": gaps,
        "missing_skills": gaps,
        "recommendations": recs
    }