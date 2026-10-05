import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import init_db, AsyncSessionLocal
from app.database.seed_data import seed_initial_data

from app.api.auth import router as auth_router
from app.api.papers import router as papers_router
from app.api.chat import router as chat_router
from app.api.compare import router as compare_router
from app.api.reviews import router as reviews_router
from app.api.gaps import router as gaps_router
from app.api.ideas import router as ideas_router
from app.api.collections import router as collections_router
from app.api.notes import router as notes_router
from app.api.citations import router as citations_router
from app.api.search import router as search_router
from app.api.analytics import router as analytics_router
from app.api.export import router as export_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize tables and seed data
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            await seed_initial_data(session)
        print("Database initialized and demo data seeded successfully!")
    except Exception as e:
        print(f"Startup notice: Database init/seed: {e}")
    yield
    # Shutdown


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Research Paper Digest & Literature Assistant API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server processing error: {str(exc)}"}
    )


# Include API Routers under /api/v1
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(papers_router, prefix=api_v1)
app.include_router(chat_router, prefix=api_v1)
app.include_router(compare_router, prefix=api_v1)
app.include_router(reviews_router, prefix=api_v1)
app.include_router(gaps_router, prefix=api_v1)
app.include_router(ideas_router, prefix=api_v1)
app.include_router(collections_router, prefix=api_v1)
app.include_router(notes_router, prefix=api_v1)
app.include_router(citations_router, prefix=api_v1)
app.include_router(search_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)
app.include_router(export_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)

# Health & Info Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "LitNexa AI Platform",
        "version": "1.0.0",
        "vector_engine": "Chroma / TF-IDF Semantic Hybrid"
    }

@app.get("/")
async def root_info():
    return {
        "message": "Welcome to LitNexa API — Research Paper Digest & Literature Assistant",
        "documentation": "/docs",
        "status": "ready"
    }

