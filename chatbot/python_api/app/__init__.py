from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import Settings

def create_app() -> FastAPI:
    app = FastAPI(title="Rogue-like Game API")
    settings = Settings()

    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import and include routers
    from .routes import npcs, map
    app.include_router(npcs.router, prefix="/api")
    app.include_router(map.router, prefix="/api")

    return app
