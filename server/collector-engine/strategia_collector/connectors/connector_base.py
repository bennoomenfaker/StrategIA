from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class CollectedData:
    source_url: str
    source_type: str  # "WEB", "RSS", "PDF"
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    content_raw: str = ""
    published_at: Optional[datetime] = None


class BaseConnector(ABC):
    @abstractmethod
    async def fetch(self, url: str) -> list[CollectedData]:
        pass
