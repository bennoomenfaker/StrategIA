import re
import logging

logger = logging.getLogger(__name__)


class TextNormalizer:
    def clean(self, text: str) -> str:
        cleaned = re.sub(r"<[^>]*>", " ", text)
        cleaned = cleaned.replace("&nbsp;", " ")
        cleaned = re.sub(r"&[a-z]+;", " ", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"https?://\S+", " ", cleaned)
        cleaned = re.sub(r"[^\w\s\u00C0-\u024F]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned
