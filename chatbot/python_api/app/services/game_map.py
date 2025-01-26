from typing import Dict, Set, List, Tuple
import random
from ..models.game_models import Position, MapTile
from ..config.settings import Settings

class GameMap:
    def __init__(self):
        self.settings = Settings()
        self.width = self.settings.MAP_WIDTH
        self.height = self.settings.MAP_HEIGHT
        self.tiles: Dict[Tuple[int, int], MapTile] = {}
        self.walkable_positions: Set[Tuple[int, int]] = set()
        self.generate_map()

    def generate_map(self) -> None:
        """Generate a random map with walls and floors"""
        # First, fill everything with walls
        for y in range(self.height):
            for x in range(self.width):
                is_border = (x == 0 or x == self.width - 1 or 
                           y == 0 or y == self.height - 1)
                
                # Create walls around edges and random walls inside
                if is_border or (random.random() < self.settings.WALL_PROBABILITY):
                    self.tiles[(x, y)] = MapTile(type='wall', walkable=False)
                else:
                    self.tiles[(x, y)] = MapTile(type='floor', walkable=True)
                    self.walkable_positions.add((x, y))

        # Ensure specific positions are walkable (for player and NPCs)
        required_positions = [(5, 5), (15, 10), (10, 10)]
        for pos in required_positions:
            if pos in self.tiles:
                self.tiles[pos] = MapTile(type='floor', walkable=True)
                self.walkable_positions.add(pos)

    def is_walkable(self, position: Position) -> bool:
        """Check if a position is walkable"""
        pos_tuple = position.to_tuple()
        return (0 <= position.x < self.width and 
                0 <= position.y < self.height and 
                pos_tuple in self.walkable_positions)

    def get_valid_moves(self, position: Position) -> List[Position]:
        """Get all valid moves from a position"""
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        valid_moves = []
        
        for dx, dy in directions:
            new_pos = Position(x=position.x + dx, y=position.y + dy)
            if self.is_walkable(new_pos):
                valid_moves.append(new_pos)
        
        return valid_moves

    def to_dict(self) -> dict:
        """Convert map to dictionary for API responses"""
        return {
            "width": self.width,
            "height": self.height,
            "tiles": {
                f"{x},{y}": tile.dict() 
                for (x, y), tile in self.tiles.items()
            },
            "walkable_positions": list(self.walkable_positions)
        }
