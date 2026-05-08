import os

# Connector settings
WEB_MAX_PAGES = 5
WEB_TIMEOUT = 15
RSS_TIMEOUT = 10
PDF_TIMEOUT = 30

# Request headers
DEFAULT_HEADERS = {
    "User-Agent": "StrategIA-Bot/1.0 (Strategic Intelligence Collector)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
}

# Processing settings
SEMANTIC_THRESHOLD = float(os.getenv("SEMANTIC_THRESHOLD", "0.65"))
SEMANTIC_MODEL = os.getenv("SEMANTIC_MODEL", "all-MiniLM-L6-v2")

# Storage
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

# API
API_URL = os.getenv("API_URL", "http://localhost:3000/api")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "logs/collector.log")
