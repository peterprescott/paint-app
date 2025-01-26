from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_PORT: int = 5000
    CORS_ORIGINS: List[str] = ["*"]  # In production, replace with specific origins

    # Game Settings
    MAP_WIDTH: int = 20
    MAP_HEIGHT: int = 15
    WALL_PROBABILITY: float = 0.2
    MAX_MOVEMENT_HISTORY: int = 100
    MAX_MESSAGE_HISTORY: int = 50

    class Config:
        env_file = ".env"
