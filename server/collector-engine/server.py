#!/usr/bin/env python3
"""
StrategIA Collector Engine API Server
FastAPI server that wraps the collection engine for on-demand collection.
"""

import os
import json
import asyncio
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from strategia_collector.engine import CollectorEngine
from strategia_collector.utils.config import CollectorConfig

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StrategIA Collector Engine",
    description="Web scraping and RSS collection API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Source(BaseModel):
    url: str
    type: str  # "web", "rss", or "pdf"
    label: Optional[str] = None


class KeywordItem(BaseModel):
    word: Optional[str] = None
    type: Optional[str] = "INCLUDE"
    keyword: Optional[str] = None  # alias for word


def normalize_keyword(kw):
    """Convert string or dict keyword to normalized dict"""
    if isinstance(kw, str):
        return {"word": kw, "type": "INCLUDE"}
    elif isinstance(kw, dict):
        return kw
    return kw


class CollectRequest(BaseModel):
    planId: str
    sources: List[Source]
    keywords: Optional[List[dict]] = []
    projectId: Optional[str] = "default"

    @field_validator('keywords', mode='before')
    @classmethod
    def validate_keywords(cls, v):
        if v is None:
            return []
        return [normalize_keyword(kw) for kw in v]


class CollectResponse(BaseModel):
    success: bool
    planId: str
    itemsFound: int = 0
    itemsStored: int = 0
    message: Optional[str] = None
    wordCloud: Optional[list] = None
    items: Optional[list] = None


# Storage for background task results
collection_results = {}

# Initialize engine
from strategia_collector.storage.raw_item_service import RawItemService

db_url = os.getenv("DATABASE_URL") or "postgresql://root:root@localhost:5432/strategia_db"
logger.info(f"Using database URL: {db_url}")
storage = RawItemService(db_url)
engine = CollectorEngine(storage=storage)


@app.post("/collect", response_model=CollectResponse)
async def collect(request: CollectRequest, background_tasks: BackgroundTasks, sync: bool = False):
    """
    Trigger collection. 
    - If sync=false (default): runs in background, returns immediately
    - If sync=true: waits for completion and returns full results
    """
    logger.info(f"Received collection request for plan {request.planId}")
    logger.info(f"Sources: {len(request.sources)}, Keywords: {len(request.keywords or [])}")

    if sync:
        # Synchronous mode - wait for completion
        try:
            result = await engine.collect(
                request.planId,
                request.projectId,
                [s.model_dump() for s in request.sources],
                request.keywords or [],
            )
            
            return CollectResponse(
                success=result["success"],
                planId=request.planId,
                itemsFound=result["stats"]["items_collected"],
                itemsStored=result["stats"]["items_stored"],
                wordCloud=result.get("word_cloud", []),
                items=result.get("items", []),
            )
        except Exception as e:
            logger.error(f"Collection failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Async mode - run in background
        background_tasks.add_task(
            run_collection,
            request.planId,
            request.projectId,
            [s.model_dump() for s in request.sources],
            request.keywords or [],
        )
        
        return CollectResponse(
            success=True,
            planId=request.planId,
            message="Collection started in background",
        )


@app.get("/collect/{plan_id}/status")
async def get_collection_status(plan_id: str):
    if plan_id not in collection_results:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection_results[plan_id]


@app.post("/collect/config")
async def collect_from_config(config_path: str, background_tasks: BackgroundTasks):
    if not os.path.exists(config_path):
        raise HTTPException(status_code=400, detail="Config file not found")

    try:
        config = CollectorConfig.from_file(config_path)
        logger.info(f"Loaded config: {len(config.sources)} sources")

        sources = [
            {"url": s.url, "type": s.source_type, "label": s.label}
            for s in config.sources
        ]

        plan_id = f"config_{datetime.now(timezone.utc).timestamp()}"

        background_tasks.add_task(
            run_collection,
            plan_id,
            "default",
            sources,
            [],
        )

        return {"success": True, "planId": plan_id, "message": "Collection started"}

    except Exception as e:
        logger.error(f"Failed to load config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze")
async def ai_analyze(content: str):
    result = engine.analyze_with_ai(content)
    return result


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/")
async def root():
    return {
        "name": "StrategIA Collector Engine",
        "version": "1.0.0",
        "endpoints": {
            "POST /collect?sync=true": "Trigger collection (sync)",
            "POST /collect": "Trigger collection (async)",
            "GET /collect/{plan_id}/status": "Get collection status",
            "POST /collect/config": "Trigger from config file",
            "POST /ai/analyze": "Analyze text with AI",
            "GET /health": "Health check",
        },
    }


async def run_collection(plan_id: str, project_id: str, sources: list, keywords: list):
    """Background task to run collection and store results"""
    try:
        result = await engine.collect(plan_id, project_id, sources, keywords)

        collection_results[plan_id] = {
            "success": result["success"],
            "itemsFound": result["stats"]["items_collected"],
            "itemsStored": result["stats"]["items_stored"],
            "wordCloud": result.get("word_cloud", []),
            "completedAt": result["stats"]["completed_at"],
        }

        logger.info(f"Collection completed for plan {plan_id}")

    except Exception as e:
        import traceback
        logger.error(f"Collection failed for plan {plan_id}: {e}")
        logger.error(traceback.format_exc())
        collection_results[plan_id] = {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "completedAt": datetime.now(timezone.utc).isoformat(),
        }


if __name__ == "__main__":
    port = int(os.getenv("COLLECTOR_PORT", "8000"))
    logger.info(f"Starting StrategIA Collector Engine on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
