import logging
from datetime import datetime, timezone

from strategia_collector.connectors.web_connector import WebConnector
from strategia_collector.connectors.rss_connector import RssConnector
from strategia_collector.connectors.pdf_connector import PdfConnector
from strategia_collector.processing.keyword_filter import KeywordFilter
from strategia_collector.processing.deduplication import DeduplicationService
from strategia_collector.processing.text_normalizer import TextNormalizer
from strategia_collector.processing.word_analyzer import WordAnalyzer
from strategia_collector.processing.ai_processing import AiProcessing
from strategia_collector.storage.raw_item_service import RawItemService

logger = logging.getLogger(__name__)


class CollectorEngine:
    def __init__(self, storage: RawItemService | None = None):
        self.web_connector = WebConnector()
        self.rss_connector = RssConnector()
        self.pdf_connector = PdfConnector()
        self.keyword_filter = KeywordFilter()
        self.dedup_service = DeduplicationService()
        self.text_normalizer = TextNormalizer()
        self.word_analyzer = WordAnalyzer()
        self.ai_processing = AiProcessing()
        self.storage = storage

    async def collect(
        self,
        plan_id: str,
        project_id: str,
        sources: list[dict],
        keywords: list[dict] | None = None,
    ) -> dict:
        logger.info(f"Starting collection for plan {plan_id}, project {project_id}")

        if keywords is None:
            keywords = []

        items_collected = 0
        items_filtered = 0
        items_stored = 0
        all_items = []
        existing_hashes = set()

        if self.storage:
            existing_hashes = await self.storage.get_existing_hashes(project_id)

        for source in sources:
            source_url = source.get("url", "")
            source_type = source.get("type", "").upper()

            logger.info(f"Processing source: {source_type} - {source_url}")

            try:
                raw_items = await self._fetch_source(source_type, source_url)
                items_collected += len(raw_items)
                logger.info(f"Collected {len(raw_items)} items from {source_url}")

                filtered = [
                    item for item in raw_items
                    if self.keyword_filter.match(item.get("content_raw", ""), keywords)
                ]
                items_filtered += len(filtered)
                logger.info(f"Filtered to {len(filtered)} items by keywords")

                unique = self.dedup_service.filter_unique(filtered, existing_hashes)

                cleaned = []
                for item in unique:
                    item["content_raw"] = self.text_normalizer.clean(item.get("content_raw", ""))
                    item["word_stats"] = self.word_analyzer.get_top_words(item["content_raw"], 20)
                    cleaned.append(item)

                if self.storage:
                    saved = await self.storage.save_bulk(cleaned, plan_id, project_id, source.get("id"))
                    all_items.extend(saved)
                    items_stored += len(saved)
                    logger.info(f"Stored {len(saved)} items")
                else:
                    all_items.extend(cleaned)
                    items_stored += len(cleaned)

            except Exception as e:
                logger.error(f"Source {source_url} failed: {e}")

        word_cloud = self.word_analyzer.aggregate_word_cloud(all_items)

        logger.info(
            f"Collection completed: {items_collected} collected, "
            f"{items_filtered} filtered, {items_stored} stored"
        )

        return {
            "success": True,
            "collected": items_stored,
            "items": all_items,
            "word_cloud": word_cloud,
            "stats": {
                "items_collected": items_collected,
                "items_filtered": items_filtered,
                "items_stored": items_stored,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        }

    async def _fetch_source(self, source_type: str, url: str) -> list[dict]:
        if source_type == "WEB":
            items = await self.web_connector.fetch(url)
        elif source_type == "RSS":
            items = await self.rss_connector.fetch(url)
        elif source_type == "PDF":
            items = await self.pdf_connector.fetch(url)
        else:
            logger.warning(f"Unknown source type: {source_type}")
            return []

        return [
            {
                "source_url": item.source_url,
                "source_type": item.source_type,
                "title": item.title,
                "description": item.description,
                "content_raw": item.content_raw,
                "published_at": item.published_at,
            }
            for item in items
        ]

    def analyze_with_ai(self, content: str) -> dict:
        return self.ai_processing.process_all(content)
