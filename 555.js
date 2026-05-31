const cells = document.querySelectorAll('.cell');
        const statusDisplay = document.getElementById('status');
        const resetButton = document.getElementById('resetButton');

        let gameActive = true;
        let currentPlayer = 'X';
        let gameState = ['', '', '', '', '', '', '', '', '']; // Represents the 9 cells

        const winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        function handleCellPlayed(clickedCell, clickedCellIndex) {
            gameState[clickedCellIndex] = currentPlayer;
            clickedCell.innerHTML = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase()); // Add class for styling
        }

        function handlePlayerChange() {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;
        }

        function handleResultValidation() {
            let roundWon = false;
            for (let i = 0; i < winningConditions.length; i++) {
                const winCondition = winningConditions[i];
                let a = gameState[winCondition[0]];
                let b = gameState[winCondition[1]];
                let c = gameState[winCondition[2]];

                if (a === '' || b === '' || c === '') {
                    continue;
                }
                if (a === b && b === c) {
                    roundWon = true;
                    break;
                }
            }

            if (roundWon) {
                statusDisplay.innerHTML = `Player ${currentPlayer} has won!`;
                gameActive = false;
                return;
            }

            let roundDraw = !gameState.includes('');
            if (roundDraw) {
                statusDisplay.innerHTML = `Game ended in a draw!`;
                gameActive = false;
                return;
            }

            handlePlayerChange();
        }

        function handleCellClick(event) {
            const clickedCell = event.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

            if (gameState[clickedCellIndex] !== '' || !gameActive) {
                return;
            }

            handleCellPlayed(clickedCell, clickedCellIndex);
            handleResultValidation();
        }

        function handleResetGame() {
            gameActive = true;
            currentPlayer = 'X';
            gameState = ['', '', '', '', '', '', '', '', ''];
            statusDisplay.innerHTML = `Player ${currentPlayer}'s turn`;
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.classList.remove('x', 'o'); // Remove styling classes
            });
        }

        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        resetButton.addEventListener('click', handleResetGame);
   