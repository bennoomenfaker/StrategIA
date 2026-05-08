import logging
import re

logger = logging.getLogger(__name__)


CATEGORIES = {
    "technology": ["software", "hardware", "ai", "machine learning", "cloud", "digital", "tech"],
    "business": ["company", "startup", "funding", "revenue", "market", "ipo", "investment"],
    "science": ["research", "study", "discovery", "breakthrough", "experiment"],
    "health": ["health", "medical", "doctor", "treatment", "disease", "patient"],
    "politics": ["government", "policy", "law", "election", "minister", "president"],
    "security": ["hack", "breach", "security", "attack", "vulnerability", "malware"],
    "ai": ["gpt", "llm", "neural", "model", "training", "deep learning", "artificial intelligence"],
}

POSITIVE_WORDS = [
    "good", "great", "excellent", "amazing", "best", "success", "grow", "improve",
    "strong", "profit", "growth", "innovation", "breakthrough", "remarkable",
]

NEGATIVE_WORDS = [
    "bad", "fail", "worst", "loss", "decline", "weak", "problem", "issue",
    "bug", "crash", "breach", "hack", "attack",
]

ENTITY_PATTERNS = [
    (r"gpt[- ]?\d*", "TECHNOLOGY"),
    (r"chatgpt", "TECHNOLOGY"),
    (r"python\b", "TECHNOLOGY"),
    (r"javascript", "TECHNOLOGY"),
    (r"aws\b", "TECHNOLOGY"),
    (r"google\b", "ORG"),
    (r"microsoft\b", "ORG"),
    (r"openai\b", "ORG"),
    (r"meta\b", "ORG"),
    (r"amazon\b", "ORG"),
    (r"apple\b", "ORG"),
    (r"nvidia\b", "ORG"),
]


class AiProcessing:
    def analyze_sentiment(self, content: str) -> dict:
        lower = content.lower()
        pos_count = sum(1 for w in POSITIVE_WORDS if w in lower)
        neg_count = sum(1 for w in NEGATIVE_WORDS if w in lower)

        total = pos_count + neg_count or 1
        score = (pos_count - neg_count) / total

        if score > 0.1:
            label = "positive"
        elif score < -0.1:
            label = "negative"
        else:
            label = "neutral"

        return {
            "score": round(score, 2),
            "label": label,
            "confidence": round(min(abs(score), 1), 2),
        }

    def extract_entities(self, content: str) -> list[dict]:
        entities = []

        for pattern, entity_type in ENTITY_PATTERNS:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if not any(e["text"].lower() == match.lower() for e in entities):
                    entities.append({
                        "text": match,
                        "type": entity_type,
                        "relevance": 0.8,
                    })

        return entities[:10]

    def classify_content(self, content: str) -> dict:
        lower = content.lower()
        best_category = "technology"
        best_score = 0

        for category, keywords in CATEGORIES.items():
            score = sum(1 for kw in keywords if kw in lower)
            if score > best_score:
                best_score = score
                best_category = category

        return {
            "category": best_category,
            "confidence": round(min(best_score / 3, 1), 2),
        }

    def process_all(self, content: str) -> dict:
        return {
            "sentiment": self.analyze_sentiment(content),
            "entities": self.extract_entities(content),
            "classification": self.classify_content(content),
        }
