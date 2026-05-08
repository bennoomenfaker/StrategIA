import hashlib
import logging

logger = logging.getLogger(__name__)


class DeduplicationService:
    def generate_hash(self, title: str | None, url: str, published_at=None) -> str:
        data = "|".join([
            title or "",
            url,
            str(published_at) if published_at else "",
        ])
        return hashlib.sha256(data.encode()).hexdigest()[:16]

    def filter_unique(self, items: list, existing_hashes: set[str]) -> list:
        unique = []
        seen = set()

        for item in items:
            content_hash = self.generate_hash(
                item.get("title"),
                item.get("source_url", ""),
                item.get("published_at"),
            )

            if content_hash not in seen and content_hash not in existing_hashes:
                seen.add(content_hash)
                item["content_hash"] = content_hash
                unique.append(item)

        logger.info(f"Deduplication: {len(items)} -> {len(unique)} unique items")
        return unique
