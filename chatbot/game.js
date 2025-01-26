// Game constants
const TILE_SIZE = 32;
const PLAYER_COLOR = '#fff';
const WALL_COLOR = '#666';
const NPC_COLOR = '#ff0';
const NPC_MOVE_INTERVAL = 500; // NPC moves every 500ms

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
        size: TILE_SIZE - 4
    },
    map: [],
    canvas: null,
    ctx: null,
    statusBar: null
};

// Initialize the game
function init() {
    // Set up canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.canvas.width = 20 * TILE_SIZE;
    gameState.canvas.height = 15 * TILE_SIZE;
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.statusBar = document.getElementById('statusBar');

    // Generate simple map (0 = floor, 1 = wall)
    for (let y = 0; y < 15; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < 20; x++) {
            // Create walls around the edges and some random walls
            gameState.map[y][x] = (x === 0 || x === 19 || y === 0 || y === 14 || 
                                 (Math.random() < 0.2 && x !== 5 && y !== 5 && x !== 15 && y !== 10)) ? 1 : 0;
        }
    }

    // Set up event listeners
    window.addEventListener('keydown', handleInput);

    // Start NPC movement
    setInterval(moveNPC, NPC_MOVE_INTERVAL);

    // Start game loop
    gameLoop();
}

// Handle player input
function handleInput(event) {
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

    // Check if the new position is valid (not a wall)
    if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15 && 
        gameState.map[newY][newX] === 0) {
        gameState.player.x = newX;
        gameState.player.y = newY;
    }
}

// Move NPC randomly
function moveNPC() {
    const directions = [
        { dx: 0, dy: -1 },  // up
        { dx: 0, dy: 1 },   // down
        { dx: -1, dy: 0 },  // left
        { dx: 1, dy: 0 }    // right
    ];

    // Shuffle directions randomly
    for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    // Try each direction until we find a valid move
    for (const dir of directions) {
        const newX = gameState.npc.x + dir.dx;
        const newY = gameState.npc.y + dir.dy;

        if (newX >= 0 && newX < 20 && newY >= 0 && newY < 15 && 
            gameState.map[newY][newX] === 0) {
            gameState.npc.x = newX;
            gameState.npc.y = newY;
            break;
        }
    }
}

// Check distance between player and NPC
function checkProximity() {
    const dx = gameState.player.x - gameState.npc.x;
    const dy = gameState.player.y - gameState.npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 3) {
        gameState.statusBar.textContent = 'Hello';
    } else {
        gameState.statusBar.textContent = '';
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    gameState.ctx.fillStyle = '#000';
    gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

    // Draw map
    for (let y = 0; y < gameState.map.length; y++) {
        for (let x = 0; x < gameState.map[y].length; x++) {
            if (gameState.map[y][x] === 1) {
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

    // Draw NPC
    gameState.ctx.fillStyle = NPC_COLOR;
    gameState.ctx.fillRect(
        gameState.npc.x * TILE_SIZE + 2,
        gameState.npc.y * TILE_SIZE + 2,
        gameState.npc.size,
        gameState.npc.size
    );

    // Check proximity and update status
    checkProximity();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.onload = init;
