from fastapi import APIRouter
from ..models.game_models import Position, MapState, ValidMoves
from ..services.game_map import GameMap

router = APIRouter()
game_map = GameMap()

@router.get("/map", response_model=MapState)
async def get_map():
    """Get the current game map"""
    return game_map.to_dict()

@router.get("/map/valid-moves", response_model=ValidMoves)
async def get_valid_moves(x: int, y: int):
    """Get valid moves from a position"""
    position = Position(x=x, y=y)
    return {
        "valid_moves": game_map.get_valid_moves(position)
    }
