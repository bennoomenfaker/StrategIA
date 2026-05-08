from strategia_collector.connectors.connector_base import CollectedData

logger = __import__("logging").getLogger(__name__)


class KeywordFilter:
    def match(self, text: str, keywords: list[dict]) -> bool:
        if not text or not keywords:
            return True

        lower_text = text.lower()

        include_keywords = [
            k["word"].lower() for k in keywords if k["type"] == "INCLUDE"
        ]
        exclude_keywords = [
            k["word"].lower() for k in keywords if k["type"] == "EXCLUDE"
        ]

        if any(kw in lower_text for kw in exclude_keywords):
            return False

        if include_keywords:
            return any(kw in lower_text for kw in include_keywords)

        return True

    def get_matched_keywords(self, text: str, keywords: list[dict]) -> list[str]:
        matched = []
        lower_text = text.lower()

        include_keywords = [
            k["word"].lower() for k in keywords if k["type"] == "INCLUDE"
        ]

        for kw in include_keywords:
            if kw in lower_text:
                matched.append(kw)

        return matched
