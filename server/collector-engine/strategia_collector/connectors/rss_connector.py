import logging
import feedparser
from urllib.parse import urlparse

from strategia_collector.connectors.connector_base import BaseConnector, CollectedData

logger = logging.getLogger(__name__)


class RssConnector(BaseConnector):
    TIMEOUT = 10

    async def fetch(self, url: str) -> list[CollectedData]:
        logger.info(f"Fetching RSS feed: {url}")

        try:
            feed = feedparser.parse(url)
            items = []

            for entry in feed.entries[:20]:
                content = entry.get("content", [{}])[0].get("value", "") if entry.get("content") else ""
                content = content or entry.get("description", "") or entry.get("summary", "")

                pub_date = None
                if entry.get("published"):
                    pub_date = self._parse_date(entry.published)
                elif entry.get("updated"):
                    pub_date = self._parse_date(entry.updated)

                items.append(CollectedData(
                    source_url=entry.get("link", url),
                    source_type="RSS",
                    title=entry.get("title", ""),
                    description=content[:200],
                    content=content,
                    content_raw=content,
                    published_at=pub_date,
                ))

            feed_title = feed.feed.get("title", urlparse(url).netloc)
            logger.info(f"RSS: fetched {len(items)} items from {feed_title}")
            return items

        except Exception as e:
            logger.error(f"RSS fetch failed for {url}: {e}")
            raise

    @staticmethod
    def _parse_date(date_str: str):
        from datetime import datetime
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except Exception:
            try:
                return datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            except Exception:
                return None
