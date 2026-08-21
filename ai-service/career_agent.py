import json
import os
import requests
import google.generativeai as genai

# Configure Gemini for the Generative AI requirement
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Path to the career guides JSON in the same folder
KB_PATH = os.path.join(os.path.dirname(__file__), "career_guides.json")

def load_knowledge_base():
    try:
        with open(KB_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# TOOL 1: Search Learning Resources (RAG Knowledge Retrieval)
def search_learning_resources(role: str) -> dict:
    """Retrieves grounded learning paths and study material from the knowledge base."""
    kb = load_knowledge_base()
    for entry in kb:
        if entry.get("role", "").lower() == role.lower():
            return {
                "role": entry["role"],
                "learning_path": entry.get("learning_path", []),
                "resources": entry.get("recommended_resources", [])
            }
    return {"error": f"No specific roadmap found for {role}."}


# TOOL 2: Python Skill Analyzer API
# DOCKER FIX: Ensure it correctly appends '/analyze' to the container URL
PYTHON_SERVICE_BASE = os.getenv("PYTHON_SERVICE_URL", "http://127.0.0.1:8000").rstrip("/")
PYTHON_SERVICE_URL = f"{PYTHON_SERVICE_BASE}/analyze"

def analyze_student_skills(current_skills: list, target_role: str) -> dict:
    """Queries the Python microservice to calculate readiness and identify gaps."""
    try:
        response = requests.post(
            PYTHON_SERVICE_URL,
            json={"current_skills": current_skills, "target_role": target_role},
            timeout=5
        )
        return response.json()
    except Exception as e:
        return {"error": f"Could not connect to Python Analyzer service: {str(e)}"}


# Agent Orchestrator: Combines tools and uses Generative AI
def run_career_agent(user_query: str, current_skills: list, target_role: str) -> dict:
    # 1. Run Python OOP analyzer tool
    analysis_data = analyze_student_skills(current_skills, target_role)
    
    # 2. Run RAG knowledge retrieval tool
    resources_data = search_learning_resources(target_role)
    
    # 3. GENERATIVE AI STEP: Use Gemini to synthesize a custom roadmap
    prompt = f"""
    You are an expert Career Planning Agent. A student has asked: "{user_query}"
    
    Target Role: {target_role}
    Current Skills: {current_skills}
    
    Tool 1 (Skill Analyzer) Output:
    - Readiness Score: {analysis_data.get('readiness_score', 0)}%
    - Missing Gaps: {analysis_data.get('missing_gaps', [])}
    
    Tool 2 (RAG Knowledge Base) Output:
    - Recommended Resources: {resources_data.get('resources', [])}
    - Base Learning Path: {resources_data.get('learning_path', [])}
    
    Based on this data, generate a customized, 4-phase structured action plan for the student.
    Address their specific query if applicable.
    Return ONLY a valid JSON object with this exact structure:
    {{
        "action_plan": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ...", "Phase 4: ..."]
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        ai_response = model.generate_content(prompt)
        ai_text = ai_response.text.strip()
        
        # Clean markdown code blocks if Gemini returns them
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:-3].strip()
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:-3].strip()
            
        generated_plan = json.loads(ai_text).get("action_plan", [])
    except Exception as e:
        print(f"Gemini generation failed: {e}")
        # Fallback to static RAG data if the API call fails
        generated_plan = resources_data.get("learning_path", ["Start by learning the missing gaps."])

    # 4. Return the fully formed Agentic response
    return {
        "query": user_query,
        "role_evaluated": target_role,
        "score": analysis_data.get("readiness_score", 0),
        "skill_gaps": analysis_data.get("missing_gaps", []),
        "action_plan": generated_plan,
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