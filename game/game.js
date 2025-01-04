class RogueLikeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.walls = [];
        this.items = [];
        this.isGameRunning = false;
        this.isPaused = false;
        
        this.healthDisplay = document.getElementById('health-value');
        this.levelDisplay = document.getElementById('level-value');
        this.scoreDisplay = document.getElementById('score-value');
        
        this.startButton = document.getElementById('start-game');
        this.restartButton = document.getElementById('restart-game');
        
        this.lastUpdateTime = 0;
        this.healthLossTimer = 0;
        this.healthLossInterval = 1000; // 1 second
        this.maxHealthLossPerSecond = 50;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.toggleGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling
                this.toggleGame();
            } else {
                this.handleKeyPress(e);
            }
        });
    }
    
    toggleGame() {
        if (!this.player) {
            this.startGame();
        } else if (this.isGameRunning) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }
    
    startGame() {
        this.isGameRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = Date.now();
        this.initializePlayer();
        this.generateWalls();
        this.generateEnemies();
        this.startButton.textContent = 'Pause';
        this.startButton.style.display = 'block';
        this.restartButton.style.display = 'none';
        this.gameLoop();
    }
    
    pauseGame() {
        this.isGameRunning = false;
        this.isPaused = true;
        this.startButton.textContent = 'Resume';
    }
    
    resumeGame() {
        this.isGameRunning = true;
        this.isPaused = false;
        this.lastUpdateTime = Date.now();
        this.startButton.textContent = 'Pause';
        this.gameLoop();
    }
    
    restartGame() {
        this.enemies = [];
        this.walls = [];
        this.items = [];
        this.startGame();
        this.restartButton.style.display = 'none';
    }
    
    initializePlayer() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            speed: 10,
            health: 250,
            maxHealth: 250,
            level: 1,
            score: 0,
            nextX: this.canvas.width / 2,
            nextY: this.canvas.height / 2
        };
    }
    
    generateWalls() {
        const wallThickness = 20;
        
        // Top wall
        this.walls.push({
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: wallThickness
        });
        
        // Bottom wall
        this.walls.push({
            x: 0,
            y: this.canvas.height - wallThickness,
            width: this.canvas.width,
            height: wallThickness
        });
        
        // Left wall
        this.walls.push({
            x: 0,
            y: 0,
            width: wallThickness,
            height: this.canvas.height
        });
        
        // Right wall
        this.walls.push({
            x: this.canvas.width - wallThickness,
            y: 0,
            width: wallThickness,
            height: this.canvas.height
        });
        
        // Add some internal walls
        const internalWallCount = 3;
        for (let i = 0; i < internalWallCount; i++) {
            this.walls.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                width: Math.random() > 0.5 ? 20 : 100,
                height: Math.random() > 0.5 ? 100 : 20
            });
        }
    }
    
    generateEnemies() {
        for (let i = 0; i < 5; i++) {
            let enemy;
            do {
                enemy = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    width: 20,
                    height: 20,
                    baseSpeed: 1, // Base speed
                    speed: 1, // Current speed (can vary)
                    speedVariation: Math.random() * 0.5 + 0.5, // 0.5 to 1
                    directionJitter: {x: 0, y: 0}, // Random movement offset
                    jitterTimer: 0,
                    jitterInterval: Math.random() * 1000 + 500 // Randomize jitter timing
                };
            } while (this.checkCollisionWithWalls(enemy));
            
            this.enemies.push(enemy);
        }
    }
    
    handleKeyPress(e) {
        if (!this.isGameRunning) return;
        
        // Store next position
        this.player.nextX = this.player.x;
        this.player.nextY = this.player.y;
        
        switch(e.key) {
            case 'k': // Up
                this.player.nextY -= this.player.speed;
                break;
            case 'j': // Down
                this.player.nextY += this.player.speed;
                break;
            case 'h': // Left
                this.player.nextX -= this.player.speed;
                break;
            case 'l': // Right
                this.player.nextX += this.player.speed;
                break;
        }
        
        // Check if next position is valid
        const tempPlayer = {
            x: this.player.nextX,
            y: this.player.nextY,
            width: this.player.width,
            height: this.player.height
        };
        
        if (!this.checkCollisionWithWalls(tempPlayer)) {
            this.player.x = this.player.nextX;
            this.player.y = this.player.nextY;
        }
    }
    
    checkCollisionWithWalls(rect) {
        return this.walls.some(wall => 
            rect.x < wall.x + wall.width &&
            rect.x + rect.width > wall.x &&
            rect.y < wall.y + wall.height &&
            rect.y + rect.height > wall.y
        );
    }
    
    updateEnemies() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        // Health loss mechanism
        this.healthLossTimer += deltaTime;
        if (this.healthLossTimer >= this.healthLossInterval) {
            // Find enemies touching the player
            const touchingEnemies = this.enemies.filter(enemy => 
                this.checkCollision(this.player, enemy)
            );
            
            const healthLoss = touchingEnemies.length > 0 
                ? Math.min(this.maxHealthLossPerSecond, touchingEnemies.length * 10) 
                : 0;
            
            this.player.health = Math.max(0, this.player.health - healthLoss);
            this.updateHealthDisplay();
            
            if (this.player.health <= 0) {
                this.gameOver();
            }
            
            this.healthLossTimer = 0;
        }
        
        this.enemies.forEach((enemy, index) => {
            // Update jitter timer and direction
            enemy.jitterTimer += deltaTime;
            if (enemy.jitterTimer >= enemy.jitterInterval) {
                // Randomize direction jitter
                enemy.directionJitter.x = (Math.random() - 0.5) * 0.5;
                enemy.directionJitter.y = (Math.random() - 0.5) * 0.5;
                
                // Randomize speed slightly
                enemy.speed = enemy.baseSpeed * enemy.speedVariation;
                
                // Reset timer with new random interval
                enemy.jitterTimer = 0;
                enemy.jitterInterval = Math.random() * 1000 + 500;
            }
            
            // Store next position
            const nextEnemy = { ...enemy };
            
            // Separation behavior
            const separationForce = {x: 0, y: 0};
            const separationRadius = 50; // Radius to start separating
            
            this.enemies.forEach((otherEnemy, otherIndex) => {
                if (index === otherIndex) return;
                
                const dx = nextEnemy.x - otherEnemy.x;
                const dy = nextEnemy.y - otherEnemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < separationRadius) {
                    // Stronger separation when closer
                    const separationStrength = (separationRadius - distance) / separationRadius;
                    separationForce.x += dx * separationStrength;
                    separationForce.y += dy * separationStrength;
                }
            });
            
            // Movement towards player with separation
            const playerDx = this.player.x - nextEnemy.x;
            const playerDy = this.player.y - nextEnemy.y;
            const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            
            if (playerDistance > 0) {
                const moveRatioX = playerDx / playerDistance;
                const moveRatioY = playerDy / playerDistance;
                
                // Combine player attraction and enemy separation
                nextEnemy.x += 
                    (moveRatioX * enemy.speed) + 
                    enemy.directionJitter.x + 
                    separationForce.x * 0.1;
                
                nextEnemy.y += 
                    (moveRatioY * enemy.speed) + 
                    enemy.directionJitter.y + 
                    separationForce.y * 0.1;
            }
            
            // Check if next position is valid
            if (!this.checkCollisionWithWalls(nextEnemy)) {
                enemy.x = nextEnemy.x;
                enemy.y = nextEnemy.y;
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    calculateDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    updateHealthDisplay() {
        this.healthDisplay.textContent = `${this.player.health} / ${this.player.maxHealth}`;
    }
    
    gameOver() {
        this.isGameRunning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '40px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'block';
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw walls
        this.ctx.fillStyle = 'gray';
        this.walls.forEach(wall => {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
        
        // Draw player
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw enemies
        this.ctx.fillStyle = 'black';
        this.enemies.forEach(enemy => {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
    
    gameLoop() {
        if (!this.isGameRunning) return;
        
        this.updateEnemies();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new RogueLikeGame();
});
