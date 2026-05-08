import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from strategia_collector.connectors.connector_base import BaseConnector, CollectedData

logger = logging.getLogger(__name__)


class WebConnector(BaseConnector):
    MAX_PAGES = 5
    TIMEOUT = 15

    async def fetch(self, url: str) -> list[CollectedData]:
        return self._scrape(url)

    def _scrape(self, url: str) -> list[CollectedData]:
        logger.info(f"Scraping web pages from: {url}")

        visited = set()
        items = []
        queue = [url]
        page_count = 0

        while queue and page_count < self.MAX_PAGES:
            current_url = queue.pop(0)

            if current_url in visited:
                continue
            visited.add(current_url)
            page_count += 1

            try:
                resp = requests.get(
                    current_url,
                    timeout=self.TIMEOUT,
                    headers={
                        "User-Agent": "StrategIA-Bot/1.0 (Strategic Monitoring Bot)",
                        "Accept": "text/html,application/xhtml+xml",
                    },
                )

                if resp.status_code != 200:
                    logger.warning(f"Unexpected status {resp.status_code} for {current_url}")
                    continue

                soup = BeautifulSoup(resp.text, "html.parser")

                for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                    tag.decompose()

                title = soup.title.get_text(strip=True) if soup.title else ""
                if not title:
                    h1 = soup.find("h1")
                    title = h1.get_text(strip=True) if h1 else ""

                content = soup.get_text(separator=" ", strip=True)
                content = " ".join(content.split())

                links = []
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"]
                    if href.startswith("http") or href.startswith("/"):
                        absolute = urljoin(current_url, href)
                        if absolute not in visited:
                            links.append(absolute)

                items.append(CollectedData(
                    source_url=current_url,
                    source_type="WEB",
                    title=title,
                    description=content[:200],
                    content=content,
                    content_raw=content,
                    published_at=None,
                ))

                queue.extend(links[:10])
                logger.info(f"Page {page_count}/{self.MAX_PAGES}: {current_url}")

            except Exception as e:
                logger.error(f"Failed to fetch {current_url}: {e}")

        logger.info(f"Web: scraped {len(items)} pages")
        return items
