class RogueLikeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.isGameRunning = false;
        this.isPaused = false;
        
        this.healthDisplay = document.getElementById('health-value');
        this.levelDisplay = document.getElementById('level-value');
        this.scoreDisplay = document.getElementById('score-value');
        
        this.startButton = document.getElementById('start-game');
        this.restartButton = document.getElementById('restart-game');
        
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
        this.initializePlayer();
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
        this.startButton.textContent = 'Pause';
        this.gameLoop();
    }
    
    restartGame() {
        this.enemies = [];
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
            speed: 10, // Increased player speed
            health: 100,
            level: 1,
            score: 0
        };
    }
    
    generateEnemies() {
        for (let i = 0; i < 5; i++) {
            this.enemies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: 20,
                height: 20,
                speed: 1 // Reduced enemy speed
            });
        }
    }
    
    handleKeyPress(e) {
        if (!this.isGameRunning) return;
        
        switch(e.key) {
            case 'k': // Up
                this.player.y -= this.player.speed;
                break;
            case 'j': // Down
                this.player.y += this.player.speed;
                break;
            case 'h': // Left
                this.player.x -= this.player.speed;
                break;
            case 'l': // Right
                this.player.x += this.player.speed;
                break;
        }
        
        this.checkBoundaries();
    }
    
    checkBoundaries() {
        // Keep player within canvas
        this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
        this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // Simple enemy movement towards player
            if (enemy.x < this.player.x) enemy.x += enemy.speed;
            if (enemy.x > this.player.x) enemy.x -= enemy.speed;
            if (enemy.y < this.player.y) enemy.y += enemy.speed;
            if (enemy.y > this.player.y) enemy.y -= enemy.speed;
            
            // Check collision
            if (this.checkCollision(this.player, enemy)) {
                this.player.health -= 10;
                this.updateHealthDisplay();
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateHealthDisplay() {
        this.healthDisplay.textContent = this.player.health;
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
        
        // Draw player
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw enemies
        this.ctx.fillStyle = 'red';
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
