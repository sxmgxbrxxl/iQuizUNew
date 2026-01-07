# ============================================================================
# FILE 1: utils/blooms_taxonomy.py
# ============================================================================
"""
Bloom's Taxonomy keyword definitions with 6-level classification
Distribution: 60% LOTS (Easy) / 40% HOTS (Average-Difficult)
"""

# LOTS Keywords (60% - Easy Items)
REMEMBERING_KEYWORDS = [
    "identify", "define", "list", "name", "state", "label", 
    "recall", "recognize", "match", "select", "who", "what", 
    "when", "where", "which", "memorize", "repeat", "record"
]

UNDERSTANDING_KEYWORDS = [
    "explain", "summarize", "interpret", "classify", "describe",
    "discuss", "illustrate", "paraphrase", "restate", "translate",
    "compare", "contrast", "exemplify", "infer", "outline"
]

APPLICATION_KEYWORDS = [
    "compute", "calculate", "solve", "apply", "demonstrate",
    "use", "show", "complete", "examine", "modify", "implement",
    "practice", "operate", "sketch", "employ", "execute"
]

# HOTS Keywords (40% - Average to Difficult Items)
ANALYSIS_KEYWORDS = [
    "analyze", "compare and contrast", "differentiate", "examine",
    "distinguish", "investigate", "categorize", "deconstruct",
    "breakdown", "organize", "separate", "inspect", "dissect",
    "detect", "diagram", "relate", "function", "motive", "inference"
]

EVALUATION_KEYWORDS = [
    "evaluate", "assess", "justify", "critique", "argue",
    "defend", "judge", "rate", "validate", "support",
    "recommend", "prioritize", "prove", "disprove", "appraise",
    "conclude", "measure", "rank", "test", "verify"
]

CREATING_KEYWORDS = [
    "create", "design", "formulate", "propose", "construct",
    "develop", "predict", "hypothesize", "compose", "plan",
    "generate", "devise", "invent", "synthesize", "produce",
    "compile", "devise", "modify", "what if", "imagine"
]

def get_remembering_keywords():
    """Return Remembering level keywords (10% - LOTS)"""
    return REMEMBERING_KEYWORDS

def get_understanding_keywords():
    """Return Understanding level keywords (20% - LOTS)"""
    return UNDERSTANDING_KEYWORDS

def get_application_keywords():
    """Return Application level keywords (30% - LOTS)"""
    return APPLICATION_KEYWORDS

def get_analysis_keywords():
    """Return Analysis level keywords (15% - HOTS)"""
    return ANALYSIS_KEYWORDS

def get_evaluation_keywords():
    """Return Evaluation level keywords (15% - HOTS)"""
    return EVALUATION_KEYWORDS

def get_creating_keywords():
    """Return Creating level keywords (10% - HOTS)"""
    return CREATING_KEYWORDS

def get_lots_keywords():
    """Return all LOTS keywords (Remembering + Understanding + Application = 60%)"""
    return REMEMBERING_KEYWORDS + UNDERSTANDING_KEYWORDS + APPLICATION_KEYWORDS

def get_hots_keywords():
    """Return all HOTS keywords (Analysis + Evaluation + Creating = 40%)"""
    return ANALYSIS_KEYWORDS + EVALUATION_KEYWORDS + CREATING_KEYWORDS

def get_all_keywords_by_level():
    """Return dictionary with all 6 levels"""
    return {
        "remembering": REMEMBERING_KEYWORDS,
        "understanding": UNDERSTANDING_KEYWORDS,
        "application": APPLICATION_KEYWORDS,
        "analysis": ANALYSIS_KEYWORDS,
        "evaluation": EVALUATION_KEYWORDS,
        "creating": CREATING_KEYWORDS
    }

def get_difficulty_mapping():
    """Return difficulty level for each Bloom's level"""
    return {
        "remembering": "easy",
        "understanding": "easy",
        "application": "easy",
        "analysis": "average",
        "evaluation": "average",
        "creating": "difficult"
    }

def get_lots_hots_mapping():
    """Return LOTS/HOTS classification for each level"""
    return {
        "remembering": "LOTS",
        "understanding": "LOTS",
        "application": "LOTS",
        "analysis": "HOTS",
        "evaluation": "HOTS",
        "creating": "HOTS"
    }