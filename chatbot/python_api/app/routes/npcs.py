from fastapi import APIRouter, HTTPException
from typing import Dict, Optional
from ..models.game_models import Position, Message, NPCState
from ..services.npc import NonPlayableCharacter
from ..services.game_map import GameMap

router = APIRouter()
game_map = GameMap()

# Initialize NPCs
npcs: Dict[str, NonPlayableCharacter] = {
    "yellow_npc": NonPlayableCharacter(
        id="yellow_npc",
        position=Position(x=15, y=10),
        available_messages=["Hello"],
        color="#ff0"
    ),
    "blue_npc": NonPlayableCharacter(
        id="blue_npc",
        position=Position(x=10, y=10),
        available_messages=["Bonjour!", "How are you?", "Where are you going?"],
        color="#00f"
    )
}

@router.get("/npcs")
async def get_npcs() -> Dict[str, NPCState]:
    """Get all NPCs and their current states"""
    return {npc_id: npc.to_dict() for npc_id, npc in npcs.items()}

@router.post("/npc/{npc_id}/move")
async def move_npc(npc_id: str, new_position: Position) -> NPCState:
    """Update NPC position"""
    if npc_id not in npcs:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    if not game_map.is_walkable(new_position):
        raise HTTPException(status_code=400, detail="Invalid move - position not walkable")
    
    npcs[npc_id].move_to(new_position)
    return npcs[npc_id].to_dict()

@router.get("/npc/{npc_id}/message")
async def get_next_message(npc_id: str) -> Message:
    """Get the next message for an NPC"""
    if npc_id not in npcs:
        raise HTTPException(status_code=404, detail="NPC not found")
    return npcs[npc_id].speak()

@router.get("/npc/{npc_id}/history")
async def get_npc_history(npc_id: str, limit: Optional[int] = 10):
    """Get conversation history for an NPC"""
    if npc_id not in npcs:
        raise HTTPException(status_code=404, detail="NPC not found")
    return {
        "messages": [msg.dict() for msg in npcs[npc_id].get_recent_conversations(limit)],
        "movements": [
            {"position": pos.dict(), "timestamp": ts.isoformat()} 
            for pos, ts in npcs[npc_id].movement_history[-limit:]
        ]
    }

@router.post("/npc/{npc_id}/hear")
async def npc_hear_message(npc_id: str, message: str):
    """Record a message that the NPC has heard from the player"""
    if npc_id not in npcs:
        raise HTTPException(status_code=404, detail="NPC not found")
    npcs[npc_id].hear(message)
    return {"status": "Message recorded"}
