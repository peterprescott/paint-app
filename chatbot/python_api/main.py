import uvicorn
from app import create_app
from app.config.settings import Settings

app = create_app()

if __name__ == "__main__":
    settings = Settings()
    uvicorn.run("main:app", host="0.0.0.0", port=settings.API_PORT, reload=True)