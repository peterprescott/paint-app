from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Position(BaseModel):
    x: int
    y: int

    def to_tuple(self) -> tuple[int, int]:
        return (self.x, self.y)

class Message(BaseModel):
    content: str
    timestamp: datetime
    speaker: str  # 'npc' or 'player'
    heard_by_player: bool

class MapTile(BaseModel):
    type: str  # 'floor', 'wall'
    walkable: bool

class NPCState(BaseModel):
    id: str
    position: Position
    color: str
    available_messages: List[str]
    message_history: List[Message]
    total_messages_exchanged: int

class MapState(BaseModel):
    width: int
    height: int
    tiles: dict[str, MapTile]
    walkable_positions: List[tuple[int, int]]

class ValidMoves(BaseModel):
    valid_moves: List[Position]

class MessageResponse(BaseModel):
    message: str

class MovementHistory(BaseModel):
    position: Position
    timestamp: datetime
