const playerScoreSpan = document.getElementById('player-score');
const computerScoreSpan = document.getElementById('computer-score');
const resultMessageDiv = document.getElementById('result-message');
const playerChoiceEmoji = document.getElementById('player-choice-emoji');
const computerChoiceEmoji = document.getElementById('computer-choice-emoji');
const rockButton = document.getElementById('rock');
const paperButton = document.getElementById('paper');
const scissorsButton = document.getElementById('scissors');
const resetBtn = document.getElementById('reset-btn');
const homeBtn = document.getElementById('home-btn');
const winCountSpan = document.getElementById('win-count');
const lossCountSpan = document.getElementById('loss-count');
const drawCountSpan = document.getElementById('draw-count');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

let playerScore = 0;
let computerScore = 0;
let winCount = 0;
let lossCount = 0;
let drawCount = 0;
let difficulty = 'easy';

const choiceEmojis = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

// Difficulty levels with prediction accuracy
const difficultyLevels = {
    easy: { nextMovePredictor: 0.2 },      // 20% chance to predict
    medium: { nextMovePredictor: 0.5 },    // 50% chance to predict
    hard: { nextMovePredictor: 0.9 }       // 90% chance to predict
};

// Store player's recent moves to predict
let playerMoves = [];

function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    const random = Math.random();
    const difficultyConfig = difficultyLevels[difficulty];
    
    if (playerMoves.length > 0 && random < difficultyConfig.nextMovePredictor) {
        // Computer tries to counter player's last move
        const lastPlayerMove = playerMoves[playerMoves.length - 1];
        if (lastPlayerMove === 'rock') return 'paper';
        if (lastPlayerMove === 'paper') return 'scissors';
        if (lastPlayerMove === 'scissors') return 'rock';
    }
    
    // Random choice
    return choices[Math.floor(Math.random() * choices.length)];
}

function getWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        return 'win';
    } else {
        return 'lose';
    }
}

function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    const result = getWinner(playerChoice, computerChoice);
    
    // Store player move
    playerMoves.push(playerChoice);
    if (playerMoves.length > 5) playerMoves.shift(); // Keep only last 5 moves
    
    // Update emoji displays
    playerChoiceEmoji.textContent = choiceEmojis[playerChoice];
    computerChoiceEmoji.textContent = choiceEmojis[computerChoice];
    
    // Update scores and messages
    resultMessageDiv.classList.remove('win', 'lose', 'draw');
    
    let message = '';
    if (result === 'win') {
        playerScore++;
        winCount++;
        message = `You win! 🎉 ${choiceEmojis[playerChoice]} beats ${choiceEmojis[computerChoice]}`;
        resultMessageDiv.classList.add('win');
    } else if (result === 'lose') {
        computerScore++;
        lossCount++;
        message = `You lose! 😢 ${choiceEmojis[computerChoice]} beats ${choiceEmojis[playerChoice]}`;
        resultMessageDiv.classList.add('lose');
    } else {
        drawCount++;
        message = `It's a draw! 🤝 Both chose ${choiceEmojis[playerChoice]}`;
        resultMessageDiv.classList.add('draw');
    }
    
    // Update UI
    playerScoreSpan.textContent = playerScore;
    computerScoreSpan.textContent = computerScore;
    resultMessageDiv.textContent = message;
    winCountSpan.textContent = winCount;
    lossCountSpan.textContent = lossCount;
    drawCountSpan.textContent = drawCount;
}

// Event listeners for game buttons
rockButton.addEventListener('click', () => playGame('rock'));
paperButton.addEventListener('click', () => playGame('paper'));
scissorsButton.addEventListener('click', () => playGame('scissors'));

// Difficulty selector
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
        playerMoves = []; // Reset player moves when changing difficulty
    });
});

// Reset button
resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    winCount = 0;
    lossCount = 0;
    drawCount = 0;
    playerMoves = [];
    playerChoiceEmoji.textContent = '❓';
    computerChoiceEmoji.textContent = '❓';
    resultMessageDiv.textContent = 'Choose your weapon!';
    resultMessageDiv.classList.remove('win', 'lose', 'draw');
    playerScoreSpan.textContent = '0';
    computerScoreSpan.textContent = '0';
    winCountSpan.textContent = '0';
    lossCountSpan.textContent = '0';
    drawCountSpan.textContent = '0';
});

// Home button
homeBtn.addEventListener('click', () => {
    window.location.href = '../../MY WEBSITE/HOME/HOME.HTML';
});