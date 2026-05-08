#!/usr/bin/env python3
import os
import sys
import json
import logging
import asyncio
from pathlib import Path

from strategia_collector.engine import CollectorEngine
from strategia_collector.utils.config import CollectorConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def run_from_config(config_path: str):
    config = CollectorConfig.from_file(config_path)
    logger.info("Loaded config: %d sources", len(config.sources))

    engine = CollectorEngine()

    sources = [
        {"url": s.url, "type": s.source_type, "label": s.label}
        for s in config.sources
    ]

    keywords = []
    for source in config.sources:
        for kw in source.include_keywords:
            keywords.append({"word": kw, "type": "INCLUDE"})
        for kw in source.exclude_keywords:
            keywords.append({"word": kw, "type": "EXCLUDE"})

    result = await engine.collect(
        plan_id="config_run",
        project_id="default",
        sources=sources,
        keywords=keywords,
    )

    logger.info(f"Result: {json.dumps(result['stats'], indent=2)}")
    logger.info(f"Word cloud: {json.dumps(result['word_cloud'][:5], indent=2)}")


async def run_web_only(urls: str):
    engine = CollectorEngine()
    url_list = [u.strip() for u in urls.split(",") if u.strip()]
    sources = [{"url": u, "type": "web"} for u in url_list]

    result = await engine.collect(
        plan_id="web_run",
        project_id="default",
        sources=sources,
        keywords=[],
    )

    logger.info(f"Result: {json.dumps(result['stats'], indent=2)}")


async def run_rss_only(urls: str):
    engine = CollectorEngine()
    url_list = [u.strip() for u in urls.split(",") if u.strip()]
    sources = [{"url": u, "type": "rss"} for u in url_list]

    result = await engine.collect(
        plan_id="rss_run",
        project_id="default",
        sources=sources,
        keywords=[],
    )

    logger.info(f"Result: {json.dumps(result['stats'], indent=2)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python run.py config <path/to/config.json>")
        print("  python run.py web <url1,url2,...>")
        print("  python run.py rss <url1,url2,...>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "config":
        if len(sys.argv) < 3:
            print("Error: config requires a path argument")
            sys.exit(1)
        asyncio.run(run_from_config(sys.argv[2]))
    elif command == "web":
        if len(sys.argv) < 3:
            print("Error: web requires URLs argument")
            sys.exit(1)
        asyncio.run(run_web_only(sys.argv[2]))
    elif command == "rss":
        if len(sys.argv) < 3:
            print("Error: rss requires feed URLs argument")
            sys.exit(1)
        asyncio.run(run_rss_only(sys.argv[2]))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
