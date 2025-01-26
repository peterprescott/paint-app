// Game constants
const TILE_SIZE = 32;
const PLAYER_COLOR = '#fff';
const WALL_COLOR = '#666';
const NPC_COLOR = '#ff0';
const NPC2_COLOR = '#00f';
const NPC_MOVE_INTERVAL = 500; // NPC moves every 500ms
const API_URL = 'http://localhost:5000/api';

// Game state
const gameState = {
    player: {
        x: 5,
        y: 5,
        size: TILE_SIZE - 4
    },
    npc: {
        x: 15,
        y: 10,
        size: TILE_SIZE - 4,
        inRange: false
    },
    npc2: {
        x: 10,
        y: 10,
        size: TILE_SIZE - 4,
        messageIndex: 0,
        messages: ['Bonjour!', 'How are you?', 'Where are you going?'],
        inRange: false
    },
    map: {
        tiles: {},
        width: 20,
        height: 15,
        walkablePositions: new Set()
    },
    canvas: null,
    ctx: null,
    statusBar: null
};

// Initialize the game
async function init() {
    // Set up canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.canvas.width = 20 * TILE_SIZE;
    gameState.canvas.height = 15 * TILE_SIZE;
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.statusBar = document.getElementById('statusBar');

    // Fetch map from backend
    try {
        const response = await fetch(`${API_URL}/map`);
        const mapData = await response.json();
        gameState.map.width = mapData.width;
        gameState.map.height = mapData.height;
        
        // Convert tiles to game state format
        for (const [pos, tile] of Object.entries(mapData.tiles)) {
            const [x, y] = pos.split(',').map(Number);
            gameState.map.tiles[`${x},${y}`] = tile;
            if (tile.walkable) {
                gameState.map.walkablePositions.add(`${x},${y}`);
            }
        }
    } catch (error) {
        console.error('Failed to fetch map:', error);
    }

    // Initialize NPCs from backend
    try {
        const response = await fetch(`${API_URL}/npcs`);
        const npcs = await response.json();
        if (npcs.yellow_npc) {
            gameState.npc.x = npcs.yellow_npc.position.x;
            gameState.npc.y = npcs.yellow_npc.position.y;
        }
        if (npcs.blue_npc) {
            gameState.npc2.x = npcs.blue_npc.position.x;
            gameState.npc2.y = npcs.blue_npc.position.y;
            gameState.npc2.messages = npcs.blue_npc.available_messages;
        }
    } catch (error) {
        console.error('Failed to fetch NPCs:', error);
    }

    // Set up event listeners
    window.addEventListener('keydown', handleInput);

    // Start NPC movements
    setInterval(() => {
        moveNPC(gameState.npc, 'yellow_npc');
        moveNPC(gameState.npc2, 'blue_npc');
    }, NPC_MOVE_INTERVAL);

    // Start game loop
    gameLoop();
}

// Handle player input
async function handleInput(event) {
    const key = event.key.toLowerCase();
    let newX = gameState.player.x;
    let newY = gameState.player.y;

    // Support both Vim keys and arrow keys
    switch (key) {
        case 'k':        // up
        case 'arrowup':
            newY--;
            break;
        case 'j':        // down
        case 'arrowdown':
            newY++;
            break;
        case 'h':        // left
        case 'arrowleft':
            newX--;
            break;
        case 'l':        // right
        case 'arrowright':
            newX++;
            break;
    }

    // Check if the new position is walkable
    if (gameState.map.walkablePositions.has(`${newX},${newY}`)) {
        gameState.player.x = newX;
        gameState.player.y = newY;
    }
}

// Move NPC randomly
async function moveNPC(npc, npcId) {
    try {
        // Get valid moves from backend
        const response = await fetch(`${API_URL}/map/valid-moves?x=${npc.x}&y=${npc.y}`);
        const data = await response.json();
        const validMoves = data.valid_moves;

        if (validMoves.length > 0) {
            // Choose random valid move
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            npc.x = move.x;
            npc.y = move.y;
            
            // Update position in backend
            await fetch(`${API_URL}/npc/${npcId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    x: move.x,
                    y: move.y
                })
            });
        }
    } catch (error) {
        console.error(`Failed to move ${npcId}:`, error);
    }
}

// Check distance between player and NPCs
async function checkProximity() {
    // Check first NPC (yellow)
    const dx1 = gameState.player.x - gameState.npc.x;
    const dy1 = gameState.player.y - gameState.npc.y;
    const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

    // Check second NPC (blue)
    const dx2 = gameState.player.x - gameState.npc2.x;
    const dy2 = gameState.player.y - gameState.npc2.y;
    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (distance2 <= 3) {
        if (!gameState.npc2.inRange) {
            // Get next message from backend
            try {
                const response = await fetch(`${API_URL}/npc/blue_npc/message`);
                const data = await response.json();
                if (data.message) {
                    gameState.statusBar.textContent = data.message;
                }
            } catch (error) {
                console.error('Failed to fetch message:', error);
            }
            gameState.npc2.inRange = true;
        }
    } else {
        gameState.npc2.inRange = false;
        if (distance1 <= 3) {
            if (!gameState.npc.inRange) {
                try {
                    const response = await fetch(`${API_URL}/npc/yellow_npc/message`);
                    const data = await response.json();
                    if (data.message) {
                        gameState.statusBar.textContent = data.message;
                    }
                } catch (error) {
                    console.error('Failed to fetch message:', error);
                }
                gameState.npc.inRange = true;
            }
        } else {
            gameState.npc.inRange = false;
            gameState.statusBar.textContent = '';
        }
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    gameState.ctx.fillStyle = '#000';
    gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Draw map
    for (let y = 0; y < gameState.map.height; y++) {
        for (let x = 0; x < gameState.map.width; x++) {
            const tile = gameState.map.tiles[`${x},${y}`];
            if (tile && tile.type === 'wall') {
                gameState.ctx.fillStyle = WALL_COLOR;
                gameState.ctx.fillRect(
                    x * TILE_SIZE,
                    y * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
        }
    }

    // Draw player
    gameState.ctx.fillStyle = PLAYER_COLOR;
    gameState.ctx.fillRect(
        gameState.player.x * TILE_SIZE + 2,
        gameState.player.y * TILE_SIZE + 2,
        gameState.player.size,
        gameState.player.size
    );

    // Draw first NPC (yellow)
    gameState.ctx.fillStyle = NPC_COLOR;
    gameState.ctx.fillRect(
        gameState.npc.x * TILE_SIZE + 2,
        gameState.npc.y * TILE_SIZE + 2,
        gameState.npc.size,
        gameState.npc.size
    );

    // Draw second NPC (blue)
    gameState.ctx.fillStyle = NPC2_COLOR;
    gameState.ctx.fillRect(
        gameState.npc2.x * TILE_SIZE + 2,
        gameState.npc2.y * TILE_SIZE + 2,
        gameState.npc2.size,
        gameState.npc2.size
    );

    // Check proximity and update status
    checkProximity();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.onload = init;
