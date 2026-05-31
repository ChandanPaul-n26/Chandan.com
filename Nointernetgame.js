const dino = document.getElementById("dino");
const obstacle = document.getElementById("obstacle");
const powerupEl = document.getElementById("powerup");
const shieldEl = document.getElementById("shield");
const scoreDisplay = document.getElementById("score-display");
const scorePanel = document.getElementById("score");
const highScorePanel = document.getElementById("highScore");
const levelPanel = document.getElementById("level");
const gameOverDisplay = document.getElementById("gameOver");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const frame = document.querySelector(".frame");

let isJumping = false;
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let level = 1;
let hasShield = false;
let scoreInterval;
let gameLoopInterval;
let obstacleSpeed = 10;
let gameSpeed = 20;
let difficulty = 'easy';

highScorePanel.textContent = highScore;

// Difficulty settings
const difficultySettings = {
    easy: { speed: 10, spawnRate: 0.02, powerupRate: 0.003 },
    medium: { speed: 15, spawnRate: 0.03, powerupRate: 0.002 },
    hard: { speed: 20, spawnRate: 0.04, powerupRate: 0.0015 },
    extreme: { speed: 25, spawnRate: 0.05, powerupRate: 0.001 }
};

// Set difficulty
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!isGameOver) {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            obstacleSpeed = difficultySettings[difficulty].speed;
            restartGame();
        }
    });
});

function jump() {
    if (isJumping || isGameOver) return;

    isJumping = true;
    let position = 0;
    let velocity = 16;
    const gravity = 0.7;

    // Prevent the dino from jumping outside the frame
    const frameHeight = frame.clientHeight || 420;
    const dinoHeight = dino.clientHeight || 80;
    const maxJumpHeight = Math.max(180, Math.min(frameHeight - dinoHeight - 20, 320));

    const jumpInterval = setInterval(() => {
        position += velocity;
        velocity -= gravity;

        if (position >= maxJumpHeight) {
            position = maxJumpHeight;
            velocity = 0;
        }

        if (position <= 0) {
            position = 0;
            clearInterval(jumpInterval);
            isJumping = false;
        }

        dino.style.bottom = position + "px";
    }, 12);
}

function spawnObstacle() {
    let obstaclePosition = frame.offsetWidth;
    obstacle.style.left = obstaclePosition + "px";
    obstacle.style.display = "block";

    gameLoopInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(gameLoopInterval);
            return;
        }

        obstaclePosition -= obstacleSpeed;
        obstacle.style.left = obstaclePosition + "px";

        if (obstaclePosition < -60) {
            clearInterval(gameLoopInterval);
            score += 10;
            level = Math.floor(score / 100) + 1;
            updateLevel();
            
            // Spawn powerup sometimes
            if (Math.random() < difficultySettings[difficulty].powerupRate) {
                spawnPowerup();
            }
            
            spawnObstacle();
            return;
        }

        checkCollision();
    }, gameSpeed);
}

function spawnPowerup() {
    let powerupPosition = frame.offsetWidth;
    powerupEl.style.left = powerupPosition + "px";
    powerupEl.style.display = "block";
    
    let powerupInterval = setInterval(() => {
        powerupPosition -= obstacleSpeed;
        powerupEl.style.left = powerupPosition + "px";
        
        if (powerupPosition < -50) {
            clearInterval(powerupInterval);
            powerupEl.style.display = "none";
            return;
        }
        
        // Check powerup collection
        let dinoRect = dino.getBoundingClientRect();
        let powerupRect = powerupEl.getBoundingClientRect();
        
        if (dinoRect.left < powerupRect.right && dinoRect.right > powerupRect.left &&
            dinoRect.bottom > powerupRect.top && dinoRect.top < powerupRect.bottom) {
            activateShield();
            powerupEl.style.display = "none";
            clearInterval(powerupInterval);
        }
    }, gameSpeed);
}

function activateShield() {
    hasShield = true;
    shieldEl.style.display = "block";
    score += 50;
    
    setTimeout(() => {
        hasShield = false;
        shieldEl.style.display = "none";
    }, 8000);
}

function checkCollision() {
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    if (dinoRect.left < obstacleRect.right && dinoRect.right > obstacleRect.left &&
        dinoRect.bottom > obstacleRect.top && dinoRect.top < obstacleRect.bottom) {
        if (hasShield) {
            hasShield = false;
            shieldEl.style.display = "none";
            obstacle.style.left = "-100px";
        } else {
            endGame();
        }
    }
}

function updateScore() {
    if (!isGameOver) {
        score++;
        level = Math.floor(score / 100) + 1;
        scoreDisplay.textContent = "Score: " + score;
        scorePanel.textContent = score;
        levelPanel.textContent = level;
        updateLevel();
    }
}

function updateLevel() {
    levelPanel.textContent = level;
    // Gradually increase difficulty
    obstacleSpeed = difficultySettings[difficulty].speed + (level - 1) * 1.5;
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(scoreInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        highScorePanel.textContent = highScore;
        document.getElementById('high-score-display').textContent = highScore + " ✨ NEW RECORD!";
    } else {
        document.getElementById('high-score-display').textContent = highScore;
    }
    
    document.getElementById('final-score').textContent = score;
    gameOverDisplay.style.display = "block";
    obstacle.style.display = "none";
    powerupEl.style.display = "none";
    shieldEl.style.display = "none";
}

function restartGame() {
    isGameOver = false;
    score = 0;
    level = 1;
    hasShield = false;
    dino.style.bottom = "0px";
    gameOverDisplay.style.display = "none";
    scoreDisplay.textContent = "Score: 0";
    scorePanel.textContent = "0";
    levelPanel.textContent = "1";
    shieldEl.style.display = "none";
    powerupEl.style.display = "none";
    
    scoreInterval = setInterval(updateScore, 100);
    spawnObstacle();
}

function goHome() {
    window.location.href = '../../MY WEBSITE/HOME/HOME.HTML';
}

// Input handlers
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        jump();
        event.preventDefault();
    }
});

// Touch support
frame.addEventListener('click', jump);
frame.addEventListener('touchstart', jump);

window.onload = function() {
    highScorePanel.textContent = highScore;
    restartGame();
};
