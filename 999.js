const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileSize = 20;

let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: Math.random() * (400 / tileSize) | 0 * tileSize, y: Math.random() * (400 / tileSize) | 0 * tileSize };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval = null;
let gameRunning = true;
let wrapMode = false; // NEW: Track wrap mode

document.getElementById('score').innerText = 'Score: 0';
document.getElementById('high-score').innerText = 'High Score: ' + highScore;

// Arrow key controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
        event.preventDefault();
    } else if (event.key === 'ArrowDown' && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
        event.preventDefault();
    } else if (event.key === 'ArrowLeft' && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
        event.preventDefault();
    } else if (event.key === 'ArrowRight' && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
        event.preventDefault();
    }
});

function generateFood() {
    let newFood;
    let collision = true;
    
    while (collision) {
        newFood = {
            x: (Math.floor(Math.random() * (400 / tileSize))) * tileSize,
            y: (Math.floor(Math.random() * (400 / tileSize))) * tileSize
        };
        
        collision = snake.some(s => s.x === newFood.x && s.y === newFood.y);
    }
    
    return newFood;
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head with gradient and shine effect
            const gradient = ctx.createLinearGradient(segment.x, segment.y, segment.x + tileSize, segment.y + tileSize);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(0.5, '#00e676');
            gradient.addColorStop(1, '#00cc66');
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
            
            // Head shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(segment.x + 2, segment.y + 2, tileSize - 4, 4);
            
            // Eyes
            ctx.fillStyle = '#000';
            const eyeSize = 3;
            if (direction.x === 1) {
                ctx.fillRect(segment.x + 12, segment.y + 6, eyeSize, eyeSize);
                ctx.fillRect(segment.x + 12, segment.y + 11, eyeSize, eyeSize);
            } else if (direction.x === -1) {
                ctx.fillRect(segment.x + 5, segment.y + 6, eyeSize, eyeSize);
                ctx.fillRect(segment.x + 5, segment.y + 11, eyeSize, eyeSize);
            } else if (direction.y === -1) {
                ctx.fillRect(segment.x + 6, segment.y + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x + 11, segment.y + 5, eyeSize, eyeSize);
            } else if (direction.y === 1) {
                ctx.fillRect(segment.x + 6, segment.y + 12, eyeSize, eyeSize);
                ctx.fillRect(segment.x + 11, segment.y + 12, eyeSize, eyeSize);
            }
            
            // Head border
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
        } else {
            // Body with gradient
            const bodyGradient = ctx.createLinearGradient(segment.x, segment.y, segment.x + tileSize, segment.y + tileSize);
            bodyGradient.addColorStop(0, '#00cc66');
            bodyGradient.addColorStop(1, '#007744');
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
            
            // Body shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(segment.x + 2, segment.y + 2, tileSize - 4, tileSize - 4);
            
            // Body border
            ctx.strokeStyle = '#00aa55';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x, segment.y, tileSize, tileSize);
        }
    });
}

function drawFood() {
    const x = food.x;
    const y = food.y;
    
    // Apple body with gradient
    const foodGradient = ctx.createRadialGradient(x + tileSize / 2, y + tileSize / 2, 2, x + tileSize / 2, y + tileSize / 2, tileSize / 2);
    foodGradient.addColorStop(0, '#ffff44');
    foodGradient.addColorStop(0.5, '#ffdd00');
    foodGradient.addColorStop(1, '#cc9900');
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Shine on food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x + tileSize / 3, y + tileSize / 3, tileSize / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.strokeStyle = 'rgba(255, 221, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2 + 3, 0, Math.PI * 2);
    ctx.stroke();
}

function update() {
    if (!gameRunning) return;
    
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x * tileSize, y: snake[0].y + direction.y * tileSize };
    
    // Handle wrapping or wall collision
    if (wrapMode) {
        // NEW: Wrap mode - snake wraps around edges
        if (head.x < 0) head.x = 400 - tileSize;
        if (head.x >= 400) head.x = 0;
        if (head.y < 0) head.y = 400 - tileSize;
        if (head.y >= 400) head.y = 0;
    } else {
        // Normal mode - wall collision ends game
        if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400) {
            endGame();
            return;
        }
    }
    
    // Check self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').innerText = 'Score: ' + score;
        food = generateFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas with grid effect
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 400; i += tileSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 400);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
    }
    
    // NEW: Draw wrap indicators if in wrap mode
    if (wrapMode) {
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.2)';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 400, 400);
    }
    
    drawFood();
    drawSnake();
}

function gameLoop() {
    update();
    draw();
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // Draw game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 400, 400);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 200, 180);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Score: ' + score, 200, 240);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('high-score').innerText = 'High Score: ' + highScore;
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('NEW RECORD!', 200, 280);
    }
}

function restartGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameRunning = true;
    document.getElementById('score').innerText = 'Score: 0';
    food = generateFood();
    draw();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('home-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// NEW: Mode switcher
document.getElementById('normal-mode').addEventListener('click', () => {
    if (wrapMode || gameRunning) {
        wrapMode = false;
        restartGame();
        document.getElementById('normal-mode').classList.add('active');
        document.getElementById('wrap-mode').classList.remove('active');
    }
});

document.getElementById('wrap-mode').addEventListener('click', () => {
    if (!wrapMode || gameRunning) {
        wrapMode = true;
        restartGame();
        document.getElementById('wrap-mode').classList.add('active');
        document.getElementById('normal-mode').classList.remove('active');
    }
});

// Start the game
food = generateFood();
draw();
gameInterval = setInterval(gameLoop, 100);
