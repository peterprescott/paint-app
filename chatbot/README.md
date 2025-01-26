# Rogue-like Game with FastAPI Backend

A simple rogue-like game where you control a character that can interact with NPCs. The game uses a FastAPI backend to manage NPC state and interactions.

## Project Structure

```
.
├── frontend/
│   ├── index.html    # Game UI
│   └── game.js       # Game logic
└── python_api/
    ├── main.py       # FastAPI backend
    └── requirements.txt
```

## Setup and Running

1. Install Python dependencies:
```bash
cd python_api
pip install -r requirements.txt
```

2. Start the FastAPI backend:
```bash
cd python_api
uvicorn main:app --reload
```

3. Serve the frontend:
You can use any simple HTTP server. For example, with Python:
```bash
cd frontend
python -m http.server 8080
```

4. Open the game in your browser:
Visit `http://localhost:8080`

## Game Controls

- Use `h`, `j`, `k`, `l` keys (vim-style) or arrow keys to move the character
- White square: Player
- Yellow square: First NPC
- Blue square: Second NPC with multiple messages

## Features

- NPCs move randomly around the map
- NPCs display messages when the player comes within range
- Backend API manages NPC state and messages
- Messages cycle when leaving and re-entering NPC range
