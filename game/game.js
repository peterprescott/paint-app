class RogueLikeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Single Samurai avatar
        this.avatar = {
            name: 'Samurai',
            draw: (ctx, x, y, w, h) => {
                const armorColor = '#4A2C1D';
                const skinTone = '#E6C229';
                const helmetColor = '#808080';
                const outlineColor = '#000000';

                ctx.lineWidth = 2;
                ctx.strokeStyle = outlineColor;

                const drawPixelRect = (fillColor, fx, fy, fw, fh) => {
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(fx, fy, fw, fh);
                    ctx.strokeRect(fx, fy, fw, fh);
                };

                drawPixelRect(armorColor, x + 10, y + 10, w - 20, h - 20);
                drawPixelRect(helmetColor, x + 8, y, w - 16, 10);
                drawPixelRect(skinTone, x + 12, y + 10, w - 24, 10);
                
                ctx.fillStyle = outlineColor;
                ctx.fillRect(x + 12, y + 4, 4, 2);
                ctx.fillRect(x + w - 16, y + 4, 4, 2);
            }
        };
        
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
        
        // Predefined level designs
        this.levelDesigns = this.generateLevelDesigns();
        
        // Populate level select dropdown
        this.setupLevelSelect();
        
        this.setupEventListeners();
    }
    
    setupLevelSelect() {
        const levelSelect = document.getElementById('level-select');
        
        // Add options for each level
        this.levelDesigns.forEach(level => {
            const option = document.createElement('option');
            option.value = level.number;
            option.textContent = `Level ${level.number}: ${level.name}`;
            levelSelect.appendChild(option);
        });

        // Add event listener to update description
        levelSelect.addEventListener('change', (event) => {
            const selectedLevel = event.target.value;
            const levelNameEl = document.getElementById('current-level-name');
            const levelDescEl = document.getElementById('current-level-description');

            if (selectedLevel === 'random') {
                levelNameEl.textContent = 'Random Level';
                levelDescEl.textContent = 'A randomly selected level layout will be generated.';
            } else {
                const level = this.levelDesigns.find(l => l.number === parseInt(selectedLevel));
                if (level) {
                    levelNameEl.textContent = `Level ${level.number}: ${level.name}`;
                    levelDescEl.textContent = level.description;
                }
            }
        });
    }

    drawPlayer() {
        // Use the Samurai avatar's draw method
        this.avatar.draw(
            this.ctx, 
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );
    }
    
    generateLevelDesigns() {
        const levels = [
            {
                number: 1,
                name: "The Crossroads",
                description: "A symmetrical layout with intersecting walls, testing basic navigation skills.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.5 - 10, y: 0, width: 20, height: this.canvas.height * 0.4},
                    {x: this.canvas.width * 0.5 - 10, y: this.canvas.height * 0.6, width: 20, height: this.canvas.height * 0.4},
                    {x: 0, y: this.canvas.height * 0.5 - 10, width: this.canvas.width * 0.4, height: 20},
                    {x: this.canvas.width * 0.6, y: this.canvas.height * 0.5 - 10, width: this.canvas.width * 0.4, height: 20}
                ]
            },
            {
                number: 2,
                name: "Spiral Maze",
                description: "Winding walls create a challenging path with multiple turns and tight passages.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.2, width: 20, height: this.canvas.height * 0.6},
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.8 - 20, width: this.canvas.width * 0.6, height: 20},
                    {x: this.canvas.width * 0.8 - 20, y: this.canvas.height * 0.2, width: 20, height: this.canvas.height * 0.6},
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.3, width: this.canvas.width * 0.4, height: 20}
                ]
            },
            {
                number: 3,
                name: "Divided Chambers",
                description: "Segmented areas with limited passage points, requiring strategic movement.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.3, y: 0, width: 20, height: this.canvas.height * 0.5},
                    {x: this.canvas.width * 0.7, y: this.canvas.height * 0.5, width: 20, height: this.canvas.height * 0.5},
                    {x: 0, y: this.canvas.height * 0.3, width: this.canvas.width * 0.5, height: 20},
                    {x: this.canvas.width * 0.5, y: this.canvas.height * 0.7, width: this.canvas.width * 0.5, height: 20}
                ]
            },
            {
                number: 4,
                name: "Diagonal Barriers",
                description: "Angled walls create unique navigation challenges and require precise movement.",
                outerWalls: true,
                walls: [
                    {x: 0, y: this.canvas.height * 0.3, width: this.canvas.width * 0.7, height: 20, rotation: 45},
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.7, width: this.canvas.width * 0.7, height: 20, rotation: -45}
                ]
            },
            {
                number: 5,
                name: "Obstacle Course",
                description: "Scattered wall segments create a complex navigation environment.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.2, width: 20, height: 100},
                    {x: this.canvas.width * 0.5, y: this.canvas.height * 0.4, width: 20, height: 100},
                    {x: this.canvas.width * 0.8, y: this.canvas.height * 0.6, width: 20, height: 100}
                ]
            },
            {
                number: 6,
                name: "Zigzag Challenge",
                description: "Navigate through a series of alternating diagonal walls.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.1, y: this.canvas.height * 0.2, width: this.canvas.width * 0.4, height: 20, rotation: 30},
                    {x: this.canvas.width * 0.5, y: this.canvas.height * 0.5, width: this.canvas.width * 0.4, height: 20, rotation: -30},
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.8, width: this.canvas.width * 0.4, height: 20, rotation: 30}
                ]
            },
            {
                number: 7,
                name: "Narrow Passages",
                description: "Tight corridors test your ability to navigate with precision.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.2, y: 0, width: 20, height: this.canvas.height * 0.4},
                    {x: this.canvas.width * 0.8 - 20, y: this.canvas.height * 0.6, width: 20, height: this.canvas.height * 0.4},
                    {x: 0, y: this.canvas.height * 0.4, width: this.canvas.width * 0.3, height: 20},
                    {x: this.canvas.width * 0.7, y: this.canvas.height * 0.6, width: this.canvas.width * 0.3, height: 20}
                ]
            },
            {
                number: 8,
                name: "Checkerboard",
                description: "Alternating walls form a checkerboard pattern, offering limited pathways.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.2, width: 20, height: this.canvas.height * 0.2},
                    {x: this.canvas.width * 0.4, y: this.canvas.height * 0.4, width: 20, height: this.canvas.height * 0.2},
                    {x: this.canvas.width * 0.6, y: this.canvas.height * 0.2, width: 20, height: this.canvas.height * 0.2},
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.6, width: 20, height: this.canvas.height * 0.2}
                ]
            },
            {
                number: 9,
                name: "Circular Path",
                description: "Concentric circular walls create a maze-like path.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.25, y: this.canvas.height * 0.25, width: this.canvas.width * 0.5, height: this.canvas.height * 0.5, shape: "circle"}
                ]
            },
            {
                number: 10,
                name: "Gridlock",
                description: "A grid layout with alternating gaps to navigate.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.1, y: 0, width: 20, height: this.canvas.height * 0.3},
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.2, width: 20, height: this.canvas.height * 0.3},
                    {x: this.canvas.width * 0.5, y: this.canvas.height * 0.4, width: 20, height: this.canvas.height * 0.3}
                ]
            },
            {
                number: 11,
                name: "Crossover Chaos",
                description: "Intersecting diagonal walls create a web-like layout.",
                outerWalls: true,
                walls: [
                    {x: 0, y: 0, width: this.canvas.width, height: 20, rotation: 45},
                    {x: this.canvas.width, y: 0, width: this.canvas.width, height: 20, rotation: -45}
                ]
            },
            {
                number: 12,
                name: "Split Decisions",
                description: "Forked paths force players to make quick decisions.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.3, width: 20, height: this.canvas.height * 0.4},
                    {x: this.canvas.width * 0.7, y: this.canvas.height * 0.3, width: 20, height: this.canvas.height * 0.4}
                ]
            },
            {
                number: 13,
                name: "The Loop",
                description: "A circular path with an interior barrier requiring a detour.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.25, y: this.canvas.height * 0.25, width: this.canvas.width * 0.5, height: this.canvas.height * 0.5, shape: "circle"},
                    {x: this.canvas.width * 0.4, y: this.canvas.height * 0.4, width: this.canvas.width * 0.2, height: this.canvas.height * 0.2, shape: "circle"}
                ]
            },
            {
                number: 14,
                name: "The Zigzag Tunnel",
                description: "A single, narrow, winding passage challenges navigation.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.2, y: this.canvas.height * 0.1, width: 20, height: 200, rotation: 45},
                    {x: this.canvas.width * 0.5, y: this.canvas.height * 0.4, width: 20, height: 200, rotation: -45}
                ]
            },
            {
                number: 15,
                name: "Double Trouble",
                description: "Two mirrored halves create a symmetrical challenge.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.25, y: 0, width: 20, height: this.canvas.height * 0.5},
                    {x: this.canvas.width * 0.75, y: this.canvas.height * 0.5, width: 20, height: this.canvas.height * 0.5}
                ]
            },
            {
                number: 16,
                name: "Central Fort",
                description: "A fortified center with multiple pathways leading in.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.4, y: this.canvas.height * 0.4, width: this.canvas.width * 0.2, height: 20},
                    {x: this.canvas.width * 0.4, y: this.canvas.height * 0.4, width: 20, height: this.canvas.height * 0.2}
                ]
            },
            {
                number: 17,
                name: "The Spiral",
                description: "A continuous spiral wall creating a labyrinth path.",
                outerWalls: true,
                walls: [
                    {x: this.canvas.width * 0.3, y: this.canvas.height * 0.3, width: 20, height: 100, shape: "spiral"}
                ]
            }
            // Add more explicitly designed levels here
        ];

        // Combine and return all levels
        return levels;
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.toggleGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling
                this.toggleGame();
            } else if (e.key === 'r' || e.key === 'R') {
                // Allow 'R' key to restart the game
                this.restartGame();
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
        // Initialize game state
        this.isGameRunning = true;
        this.lastUpdateTime = Date.now();
        this.initializePlayer();
        this.generateWalls();
        this.generateEnemies();
        this.startButton.textContent = 'Pause';
        this.startButton.style.display = 'block';
        
        // Show restart button when game starts
        this.restartButton.style.display = 'block';
        
        // Start game loop
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
        // Reset game state completely
        this.isGameRunning = false;
        this.isPaused = false;
        
        // Reset player stats
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

        // Reset enemies
        this.enemies = [];

        // Regenerate walls based on current level selection
        this.generateWalls();

        // Regenerate enemies
        this.generateEnemies();

        // Reset UI elements
        this.healthDisplay.textContent = this.player.health;
        this.levelDisplay.textContent = this.player.level;
        this.scoreDisplay.textContent = this.player.score;

        // Reset start/pause button
        this.startButton.textContent = 'Pause';
        this.startButton.style.display = 'block';
        
        // Show restart button
        this.restartButton.style.display = 'block';

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Immediately start the game
        this.startGame();
    }
    
    findValidSpawnPoint() {
        const maxAttempts = 100;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            // Generate a random point within the canvas
            const x = Math.random() * (this.canvas.width - 60) + 30;
            const y = Math.random() * (this.canvas.height - 60) + 30;
            
            // Check if this point collides with any walls
            const doesCollide = this.walls.some(wall => 
                x < wall.x + wall.width &&
                x + 30 > wall.x &&
                y < wall.y + wall.height &&
                y + 30 > wall.y
            );
            
            // If no collision, return this point
            if (!doesCollide) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // Fallback to center if no valid point found
        return { 
            x: this.canvas.width / 2, 
            y: this.canvas.height / 2 
        };
    }

    initializePlayer() {
        // Find a valid spawn point that doesn't intersect with walls
        const spawnPoint = this.findValidSpawnPoint();
        
        // Initialize player at the valid spawn point
        this.player = {
            x: spawnPoint.x,
            y: spawnPoint.y,
            width: 30,
            height: 30,
            speed: 10,
            health: 250,
            maxHealth: 250,
            level: 1,
            score: 0,
            nextX: spawnPoint.x,
            nextY: spawnPoint.y
        };
    }

    handleKeyPress(e) {
        if (!this.isGameRunning || this.isPaused) return;

        const { key } = e;
        const speed = this.player.speed;

        // Proposed new position
        let nextX = this.player.x;
        let nextY = this.player.y;

        // Determine movement based on key
        switch (key) {
            case 'h': nextX -= speed; break;
            case 'l': nextX += speed; break;
            case 'j': nextY += speed; break;
            case 'k': nextY -= speed; break;
            default: return;
        }

        // Check for wall collisions
        const wouldCollideWithWall = this.walls.some(wall => 
            nextX < wall.x + wall.width &&
            nextX + this.player.width > wall.x &&
            nextY < wall.y + wall.height &&
            nextY + this.player.height > wall.y
        );

        if (wouldCollideWithWall) {
            // If collision would occur, find the nearest non-wall point
            const directions = [
                {x: 0, y: speed},    // Down
                {x: 0, y: -speed},   // Up
                {x: speed, y: 0},    // Right
                {x: -speed, y: 0}    // Left
            ];

            for (const dir of directions) {
                const testX = this.player.x + dir.x;
                const testY = this.player.y + dir.y;

                const wouldCollide = this.walls.some(wall => 
                    testX < wall.x + wall.width &&
                    testX + this.player.width > wall.x &&
                    testY < wall.y + wall.height &&
                    testY + this.player.height > wall.y
                );

                if (!wouldCollide) {
                    // Move to the first valid adjacent point
                    nextX = testX;
                    nextY = testY;
                    break;
                }
            }
        }

        // Update player position
        this.player.x = nextX;
        this.player.y = nextY;
        this.player.nextX = nextX;
        this.player.nextY = nextY;
    }
    
    generateEnemies() {
        // Modify enemy generation to avoid walls
        for (let i = 0; i < 5; i++) {
            let enemy;
            let attempts = 0;
            do {
                enemy = {
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    width: 20,
                    height: 20,
                    baseSpeed: 1,
                    speed: 1,
                    speedVariation: Math.random() * 0.5 + 0.5,
                    directionJitter: {x: 0, y: 0},
                    jitterTimer: 0,
                    jitterInterval: Math.random() * 1000 + 500
                };
                attempts++;
                
                // Prevent infinite loop
                if (attempts > 100) {
                    console.warn('Could not place enemy without wall collision');
                    break;
                }
            } while (this.checkCollisionWithWalls(enemy));
            
            this.enemies.push(enemy);
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
    
    generateWalls() {
        const wallThickness = 20;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Reset walls
        this.walls = [];
        
        // Get selected level from dropdown
        const levelSelect = document.getElementById('level-select');
        const selectedLevel = levelSelect.value;
        
        let levelDesign;
        if (selectedLevel === 'random') {
            // Random level selection
            levelDesign = this.levelDesigns[Math.floor(Math.random() * this.levelDesigns.length)];
            
            // Update level description for random selection
            const levelNameEl = document.getElementById('current-level-name');
            const levelDescEl = document.getElementById('current-level-description');
            levelNameEl.textContent = `Level ${levelDesign.number}: ${levelDesign.name}`;
            levelDescEl.textContent = levelDesign.description;
        } else {
            // Specific level selection
            levelDesign = this.levelDesigns.find(level => level.number === parseInt(selectedLevel));
        }
        
        // Add outer walls if specified in the design
        if (levelDesign.outerWalls) {
            this.walls.push(
                // Top wall
                {x: 0, y: 0, width: canvasWidth, height: wallThickness},
                // Bottom wall
                {x: 0, y: canvasHeight - wallThickness, width: canvasWidth, height: wallThickness},
                // Left wall
                {x: 0, y: 0, width: wallThickness, height: canvasHeight},
                // Right wall
                {x: canvasWidth - wallThickness, y: 0, width: wallThickness, height: canvasHeight}
            );
        }
        
        // Add walls from the selected level design
        this.walls.push(...levelDesign.walls);
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
            // Check if wall has rotation
            if (wall.rotation !== undefined) {
                this.ctx.save();
                this.ctx.translate(wall.x + wall.width / 2, wall.y + wall.height / 2);
                this.ctx.rotate(wall.rotation * Math.PI / 180);
                this.ctx.fillRect(-wall.width / 2, -wall.height / 2, wall.width, wall.height);
                this.ctx.restore();
            } else {
                // Standard rectangular wall
                this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            }
        });
        
        // Draw player
        this.drawPlayer();
        
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
    // Ensure the canvas exists before initializing
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        const game = new RogueLikeGame('gameCanvas');
    } else {
        console.error('Game canvas not found. Check your HTML.');
    }
});
