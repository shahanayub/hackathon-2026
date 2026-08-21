"""
SkillForge Python OOP Skill Analyzer Engine
"""

class SkillAnalyzer:
    def __init__(self, current_skills: list = None, target_role: str = ""):
        self.current_skills = current_skills if current_skills is not None else []
        self.target_role = target_role
        
        # Role benchmarks with essential skills and recommended learning topics
        self.role_benchmarks = {
            "AI Engineer": {
                "skills": ["python", "machine learning", "deep learning", "rag", "vector databases", "docker", "git", "apis"],
                "topics": ["Mathematical Foundations & Neural Nets", "RAG & Vector Retrieval", "LLM Orchestration with LangChain", "Model Serving & Cloud Deployment"]
            },
            "Full Stack Developer": {
                "skills": ["javascript", "react", "node.js", "express", "mongodb", "git", "html", "css", "docker"],
                "topics": ["REST & GraphQL API Design", "State Management & React Patterns", "Database Indexing & Mongoose", "CI/CD & Containerization"]
            },
            "DevOps Engineer": {
                "skills": ["linux", "docker", "kubernetes", "terraform", "ci/cd", "git", "python", "bash", "aws"],
                "topics": ["Infrastructure as Code (IaC)", "Container Orchestration with K8s", "Automated Pipelines (GitHub Actions)", "Cloud Security & Monitoring"]
            },
            "Data Scientist": {
                "skills": ["python", "pandas", "numpy", "scikit-learn", "sql", "data visualization", "statistics", "machine learning"],
                "topics": ["Exploratory Data Analysis", "Statistical Hypothesis Testing", "Feature Engineering", "Production ML Pipelines"]
            },
            "Cybersecurity Engineer": {
                "skills": ["networking", "linux", "python", "cryptography", "penetration testing", "siem", "firewalls", "git"],
                "topics": ["Network Security & Protocols", "Vulnerability Assessment", "Identity & Access Management", "Incident Response Workflows"]
            }
        }
        
        self.benchmark = self.role_benchmarks.get(self.target_role, {"skills": [], "topics": []})
        self.benchmark_skills = self.benchmark.get("skills", [])

    def calculate_score(self) -> float:
        """Calculates a normalized readiness score based on skill match against role benchmark."""
        if not self.benchmark_skills:
            return 50.0
        
        # Convert user skills to lowercase for accurate matching
        user_skills_lower = [s.strip().lower() for s in self.current_skills]
        
        matched_count = sum(1 for req in self.benchmark_skills if req in user_skills_lower)
        score = (matched_count / len(self.benchmark_skills)) * 100
        return round(score, 2)

    def identify_gaps(self) -> list:
        """Identifies missing skills compared against role benchmark."""
        if not self.benchmark_skills:
            return []
        
        user_skills_lower = [s.strip().lower() for s in self.current_skills]
        return [req for req in self.benchmark_skills if req not in user_skills_lower]

    def recommend_topics(self) -> list:
        """Recommends targeted learning topics for closing identified gaps."""
        if not self.benchmark.get("topics"):
            return [f"Fundamentals of {gap}" for gap in self.identify_gaps()]
        
        return self.benchmark.get("topics", [])