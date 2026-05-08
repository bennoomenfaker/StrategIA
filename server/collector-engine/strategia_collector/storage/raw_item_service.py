import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)


class RawItemService:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.Session = sessionmaker(bind=self.engine)

    async def get_existing_hashes(self, project_id: str) -> set[str]:
        with self.Session() as session:
            result = session.execute(
                text('SELECT "hash" FROM raw_items WHERE "projectId" = :pid'),
                {"pid": project_id},
            )
            return {row[0] for row in result}

    async def save_bulk(
        self,
        items: list[dict],
        plan_id: str,
        project_id: str,
        source_id: str | None = None,
    ) -> list[dict]:
        saved = []

        with self.Session() as session:
            for item in items:
                row_id = str(uuid.uuid4())

                session.execute(
                    text("""
                        INSERT INTO raw_items (
                            id, "projectId", "collectionPlanId", "sourceType",
                            "sourceUrl", title, "contentRaw", "fetchedAt", hash
                        ) VALUES (
                            :id, :project_id, :plan_id,
                            :source_type, :source_url, :title,
                            :content_raw, :fetched_at, :hash
                        )
                        ON CONFLICT (hash) DO NOTHING
                    """),
                    {
                        "id": row_id,
                        "project_id": project_id,
                        "plan_id": plan_id,
                        "source_type": item.get("source_type", ""),
                        "source_url": item.get("source_url", ""),
                        "title": item.get("title"),
                        "content_raw": item.get("content_raw", ""),
                        "hash": item.get("content_hash", ""),
                        "fetched_at": datetime.now(timezone.utc),
                    },
                )
                saved.append(item)

            session.commit()

        logger.info(f"Saved {len(saved)} items to database")
        return saved
