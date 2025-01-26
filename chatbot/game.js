// Game constants
const TILE_SIZE = 32;
const PLAYER_COLOR = '#fff';
const WALL_COLOR = '#666';

// Game state
const gameState = {
    player: {
        x: 5,
        y: 5,
        size: TILE_SIZE - 4
    },
    map: [],
    canvas: null,
    ctx: null
};

// Initialize the game
function init() {
    // Set up canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.canvas.width = 20 * TILE_SIZE;
    gameState.canvas.height = 15 * TILE_SIZE;
    gameState.ctx = gameState.canvas.getContext('2d');

    // Generate simple map (0 = floor, 1 = wall)
    for (let y = 0; y < 15; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < 20; x++) {
            // Create walls around the edges and some random walls
            gameState.map[y][x] = (x === 0 || x === 19 || y === 0 || y === 14 || 
                                 (Math.random() < 0.2 && x !== 5 && y !== 5)) ? 1 : 0;
        }
    }

    // Set up event listeners
    window.addEventListener('keydown', handleInput);

    // Start game loop
    gameLoop();
}

// Handle player input
function handleInput(event) {
    const key = event.key.toLowerCase();
    let newX = gameState.player.x;
    let newY = gameState.player.y;

    // Basic Vim movement keys
    switch (key) {
        case 'k':  // up
            newY--;
            break;
        case 'j':  // down
            newY++;
            break;
        case 'h':  // left
            newX--;
            break;
        case 'l':  // right
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

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.onload = init;
