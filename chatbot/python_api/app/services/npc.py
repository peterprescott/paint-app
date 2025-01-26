from typing import List, Tuple
from datetime import datetime
from ..models.game_models import Position, Message
from ..config.settings import Settings

class NonPlayableCharacter:
    def __init__(self, id: str, position: Position, available_messages: List[str], color: str):
        self.settings = Settings()
        self.id = id
        self.position = position
        self.available_messages = available_messages
        self.color = color
        self.message_history: List[Message] = []
        self.current_message_index = 0
        self.movement_history: List[Tuple[Position, datetime]] = [(position, datetime.now())]

    def move_to(self, new_position: Position) -> None:
        """Record NPC movement to a new position"""
        self.position = new_position
        self.movement_history.append((new_position, datetime.now()))
        # Keep only last N movements
        if len(self.movement_history) > self.settings.MAX_MOVEMENT_HISTORY:
            self.movement_history.pop(0)

    def speak(self) -> Message:
        """Get next message and record it in history"""
        message_content = self.available_messages[self.current_message_index]
        self.current_message_index = (self.current_message_index + 1) % len(self.available_messages)
        
        message = Message(
            content=message_content,
            timestamp=datetime.now(),
            speaker='npc',
            heard_by_player=True
        )
        self.message_history.append(message)
        
        # Keep only last N messages
        if len(self.message_history) > self.settings.MAX_MESSAGE_HISTORY:
            self.message_history.pop(0)
            
        return message

    def hear(self, message_content: str) -> None:
        """Record a message heard from the player"""
        message = Message(
            content=message_content,
            timestamp=datetime.now(),
            speaker='player',
            heard_by_player=False
        )
        self.message_history.append(message)
        
        # Keep only last N messages
        if len(self.message_history) > self.settings.MAX_MESSAGE_HISTORY:
            self.message_history.pop(0)

    def get_recent_conversations(self, limit: int = 10) -> List[Message]:
        """Get recent conversation history"""
        return sorted(self.message_history[-limit:], key=lambda x: x.timestamp)

    def to_dict(self) -> dict:
        """Convert NPC to dictionary for API responses"""
        return {
            "id": self.id,
            "position": self.position,
            "color": self.color,
            "available_messages": self.available_messages,
            "message_history": [msg.dict() for msg in self.get_recent_conversations()],
            "current_position": self.position.dict(),
            "total_messages_exchanged": len(self.message_history)
        }
