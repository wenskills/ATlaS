from pydantic import BaseModel


class SkillsGap(BaseModel):
    job_skills_detected: list[str]
    cv_skills_detected: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    extra_skills: list[str]
    skill_coverage: float


class ScoreBreakdown(BaseModel):
    skill_coverage: float
    lexical_score: float
    semantic_score: float
    parseability: float


class CompositeScore(BaseModel):
    global_score: float
    breakdown: ScoreBreakdown
    label: str


class SentenceGap(BaseModel):
    job_sentence: str
    best_cv_match: str | None
    score: float
    covered: bool
    has_match: bool


class MatchAnalysis(BaseModel):
    scores: CompositeScore
    skills: SkillsGap
    sections_detected: dict[str, bool]
    weakest_sentence_gaps: list[SentenceGap]
    cv_text_preview: str


class ImprovementAction(BaseModel):
    priority: str
    action: str
    details: str


class ImprovementPlan(BaseModel):
    source: str
    summary: str
    actions: list[ImprovementAction]
    knowledge_base_used: list[str]
    rewritten_bullet_example: str | None = None
