import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI

from app.db import create_client, get_db
from app.routers import auth, bac, drinks, sobriety, users
from app.services.indexes import create_indexes

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MongoDB: connect, ping (fail fast), set app.state.db, create indexes
    client = create_client()
    try:
        await client.admin.command("ping")
        logger.info("Successfully connected to MongoDB Atlas")
    except Exception as e:
        logger.exception("MongoDB connection failed: %s", e)
        raise ConnectionError("MongoDB connection failed. Check MONGODB_URI and network.") from e

    app.state.db = client.get_database("saferound")
    await create_indexes(app.state.db)

    # Shared HTTP client for outgoing requests (e.g. Gemini)
    app.state.http_client = httpx.AsyncClient(timeout=30.0)

    yield

    await app.state.http_client.aclose()
    client.close()


app = FastAPI(
    title="SafeRound API",
    description="Safety and drink validation backend",
    lifespan=lifespan,
)

app.include_router(drinks.router)
app.include_router(bac.router)
app.include_router(sobriety.router)
app.include_router(users.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "SafeRound API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
