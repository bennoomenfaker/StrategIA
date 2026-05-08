import os
import json
import logging
from pathlib import Path
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class SourceConfig:
    url: str
    source_type: str = "web"
    include_keywords: list[str] = field(default_factory=list)
    exclude_keywords: list[str] = field(default_factory=list)
    max_depth: int = 5
    crawl_delay: float = 1.0


@dataclass
class CollectorConfig:
    sources: list[SourceConfig] = field(default_factory=list)
    objectives: list[str] = field(default_factory=list)
    hypotheses: list[str] = field(default_factory=list)
    research_questions: list[str] = field(default_factory=list)
    semantic_threshold: float = 0.65
    semantic_model: str = "all-MiniLM-L6-v2"
    max_pages_per_source: int = 100
    output_format: str = "jsonl"
    database_url: str | None = None

    @classmethod
    def from_file(cls, path: str) -> "CollectorConfig":
        with open(path, "r") as f:
            data = json.load(f)

        sources = [
            SourceConfig(**s) for s in data.get("sources", [])
        ]

        return cls(
            sources=sources,
            objectives=data.get("objectives", []),
            hypotheses=data.get("hypotheses", []),
            research_questions=data.get("research_questions", []),
            semantic_threshold=data.get("semantic_threshold", 0.65),
            semantic_model=data.get("semantic_model", "all-MiniLM-L6-v2"),
            max_pages_per_source=data.get("max_pages_per_source", 100),
            output_format=data.get("output_format", "jsonl"),
            database_url=data.get("database_url"),
        )

    def to_scrapy_settings(self) -> dict:
        all_include = []
        all_exclude = []

        for source in self.sources:
            all_include.extend(source.include_keywords)
            all_exclude.extend(source.exclude_keywords)

        return {
            "INCLUDE_KEYWORDS": list(set(all_include)),
            "EXCLUDE_KEYWORDS": list(set(all_exclude)),
            "OBJECTIVES": self.objectives,
            "HYPOTHESES": self.hypotheses,
            "RESEARCH_QUESTIONS": self.research_questions,
            "SEMANTIC_THRESHOLD": self.semantic_threshold,
            "SEMANTIC_MODEL": self.semantic_model,
            "DATABASE_URL": self.database_url,
        }
