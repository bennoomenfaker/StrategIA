import logging

logger = logging.getLogger(__name__)

STOPWORDS = {
    "fr": {
        "le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "en", "que", "qui",
        "dans", "ce", "ci", "ne", "pas", "plus", "par", "au", "sur", "se", "sont", "avec",
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "à", "y", "a", "été",
        "être", "avoir", "fait", "faire", "peut", "pouvoir", "comme", "mais", "donc", "car",
        "ou", "si", "qu", "quand", "pour", "son", "ses", "leur", "leurs", "tout", "tous",
        "cette", "cet", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "notre", "votre",
    },
    "en": {
        "the", "and", "or", "is", "are", "was", "were", "be", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "an", "it", "its", "that", "this", "these",
        "those", "a", "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
        "she", "her", "they", "them", "their", "but", "not", "no", "so", "if", "than",
    },
}


class WordAnalyzer:
    def get_top_words(self, text: str, limit: int = 20) -> list[dict]:
        words = text.lower()
        words = __import__("re").sub(r"[^\w\s]", " ", words)
        words = words.split()

        stopwords = STOPWORDS["fr"] | STOPWORDS["en"]
        words = [w for w in words if len(w) > 2 and w not in stopwords]

        counts = {}
        for word in words:
            counts[word] = counts.get(word, 0) + 1

        sorted_words = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        result = [{"text": text, "value": value} for text, value in sorted_words[:limit]]

        logger.info(f"Word analysis: {len(counts)} unique words, top {len(result)}")
        return result

    def aggregate_word_cloud(self, items: list[dict]) -> list[dict]:
        all_words = {}

        for item in items:
            stats = item.get("word_stats", [])
            if isinstance(stats, list):
                for stat in stats:
                    if stat and "text" in stat:
                        word = stat["text"]
                        value = stat.get("value", 1)
                        all_words[word] = all_words.get(word, 0) + value

        return sorted(
            [{"text": text, "value": value} for text, value in all_words.items()],
            key=lambda x: x["value"],
            reverse=True,
        )[:20]
