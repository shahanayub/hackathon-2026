import json
import os
import requests

# Path to the career guides JSON in the same folder
KB_PATH = os.path.join(os.path.dirname(__file__), "career_guides.json")

def load_knowledge_base():
    with open(KB_PATH, "r") as f:
        return json.load(f)

# TOOL 1: Search Learning Resources (RAG Knowledge Retrieval)
def search_learning_resources(role: str) -> dict:
    """Retrieves grounded learning paths and study material from the knowledge base."""
    kb = load_knowledge_base()
    for entry in kb:
        if entry["role"].lower() == role.lower():
            return {
                "role": entry["role"],
                "learning_path": entry["learning_path"],
                "resources": entry["recommended_resources"]
            }
    return {"error": f"No specific roadmap found for {role}."}

# Updated to support both local and Docker networking
PYTHON_SERVICE_URL = os.getenv("PYTHON_SERVICE_URL", "http://127.0.0.1:8000/analyze")

def analyze_student_skills(current_skills: list, target_role: str) -> dict:
    """Queries the Python microservice to calculate readiness and identify gaps."""
    try:
        response = requests.post(
            PYTHON_SERVICE_URL,
            json={"current_skills": current_skills, "target_role": target_role}
        )
        return response.json()
    except Exception as e:
        return {"error": f"Could not connect to Python Analyzer service: {str(e)}"}

# Agent Orchestrator: Combines tools to evaluate the student
def run_career_agent(user_query: str, current_skills: list, target_role: str) -> dict:
    # 1. Run Python OOP analyzer tool
    analysis_data = analyze_student_skills(current_skills, target_role)
    
    # 2. Run RAG knowledge retrieval tool
    resources_data = search_learning_resources(target_role)
    
    # 3. Combine both into a single structured response
    return {
        "query": user_query,
        "role_evaluated": target_role,
        "score": analysis_data.get("readiness_score", 0),
        "skill_gaps": analysis_data.get("missing_gaps", []),
        "action_plan": resources_data.get("learning_path", []),
        "curated_resources": resources_data.get("resources", [])
    }

if __name__ == "__main__":
    # Test Agent
    result = run_career_agent(
        user_query="How do I become an AI Engineer?",
        current_skills=["Python", "Git"],
        target_role="AI Engineer"
    )
    print(json.dumps(result, indent=2))