import logging
import requests
from io import BytesIO

from strategia_collector.connectors.connector_base import BaseConnector, CollectedData

logger = logging.getLogger(__name__)


class PdfConnector(BaseConnector):
    TIMEOUT = 30

    async def fetch(self, url: str) -> list[CollectedData]:
        logger.info(f"Fetching PDF: {url}")

        try:
            resp = requests.get(url, timeout=self.TIMEOUT)
            resp.raise_for_status()

            import PyPDF2
            reader = PyPDF2.PdfReader(BytesIO(resp.content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""

            items = [CollectedData(
                source_url=url,
                source_type="PDF",
                title=url.split("/")[-1] or "PDF Document",
                description=text[:200],
                content=text,
                content_raw=text,
                published_at=None,
            )]

            logger.info(f"PDF: extracted {len(text)} chars")
            return items

        except Exception as e:
            logger.error(f"PDF fetch failed for {url}: {e}")
            raise
