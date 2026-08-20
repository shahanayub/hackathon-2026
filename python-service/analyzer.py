class SkillAnalyzer:
    """
    SkillAnalyzer class evaluates student skills against industry benchmarks.
    """
    def __init__(self, current_skills: list, target_role: str):
        
        self.current_skills = set([s.strip().lower() for s in current_skills])
        self.target_role = target_role.strip().lower()
        
        # Standard benchmarks for target roles
        self.role_benchmarks = {
            "ai engineer": ["python", "machine learning", "rag", "docker", "apis", "vector databases", "git"],
            "full stack developer": ["javascript", "react", "node.js", "mongodb", "express", "git", "rest api"],
            "devops engineer": ["linux", "docker", "kubernetes", "terraform", "ci/cd", "git", "bash"]
        }

    def get_benchmark_skills(self) -> list:
        """Returns the required skills for the target role."""
        return self.role_benchmarks.get(self.target_role, ["git", "python", "data structures", "apis"])

    def calculate_score(self) -> float:
        """Calculates percentage match between current skills and role benchmark."""
        benchmark = set(self.get_benchmark_skills())
        if not benchmark:
            return 0.0
        matching = self.current_skills.intersection(benchmark)
        return round((len(matching) / len(benchmark)) * 100, 2)

    def identify_gaps(self) -> list:
        """Returns the list of missing skills."""
        benchmark = set(self.get_benchmark_skills())
        return list(benchmark.difference(self.current_skills))

    def recommend_topics(self) -> list:
        """Generates prioritized learning topics based on identified gaps."""
        gaps = self.identify_gaps()
        recommendations = []
        for gap in gaps:
            recommendations.append({
                "skill": gap.title(),
                "priority": "High" if gap in ["git", "python", "docker", "apis"] else "Medium",
                "status": "Recommended"
            })
        return recommendations


if __name__ == "__main__":
    # Test run with sample student data
    student = SkillAnalyzer(
        current_skills=["Python", "Git", "JavaScript"],
        target_role="AI Engineer"
    )
    
    print("--- Skill Analysis Result ---")
    print(f"Readiness Score: {student.calculate_score()}%")
    print(f"Missing Skills (Gaps): {student.identify_gaps()}")
    print(f"Recommendations: {student.recommend_topics()}")