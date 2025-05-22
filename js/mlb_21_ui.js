document.addEventListener('DOMContentLoaded', () => {
    // Check if MLB21QuestionsGame is loaded
    if (typeof MLB21QuestionsGame === 'undefined') {
        console.error('MLB21QuestionsGame script not loaded!');
        // Display error to user in the UI
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.textContent = 'Critical error: Game logic is missing. Please refresh or contact support.';
        }
        return;
    }

    // DOM Elements
    const guessesLeftCountEl = document.getElementById('guesses-left-count');
    const revealNextBtn = document.getElementById('reveal-next-btn');
    const revealedHistoryEl = document.getElementById('revealed-history');
    const messageAreaEl = document.getElementById('message-area');
    const guessInputEl = document.getElementById('guess-input');
    const submitGuessBtn = document.getElementById('submit-guess-btn');
    const playAgainBtn = document.getElementById('play-again-btn');

    let currentGameState;

    async function startGame() {
        messageAreaEl.textContent = 'Loading game data...';
        revealNextBtn.disabled = true;
        submitGuessBtn.disabled = true;
        playAgainBtn.classList.add('hidden');

        try {
            const gameData = await MLB21QuestionsGame.loadGameData('data/mlb_21_data.json');
            if (!gameData || !gameData.players || !gameData.questions) {
                messageAreaEl.textContent = 'Failed to load game data. Please try refreshing.';
                return;
            }

            currentGameState = MLB21QuestionsGame.initializeGame(gameData.players, gameData.questions);
            if (!currentGameState) {
                messageAreaEl.textContent = 'Failed to initialize game. Please try refreshing.';
                return;
            }

            revealedHistoryEl.innerHTML = ''; // Clear previous game clues
            guessInputEl.value = '';
            messageAreaEl.textContent = '';
            renderUI(currentGameState);

        } catch (error) {
            console.error("Error starting game:", error);
            messageAreaEl.textContent = 'Error starting game. Check console for details.';
        }
    }

    function renderUI(gameState, revealedInfo) {
        if (!gameState) return;

        guessesLeftCountEl.textContent = gameState.guessesLeft;

        if (revealedInfo && revealedInfo.questionText && revealedInfo.answer) {
            const listItem = document.createElement('li');
            listItem.textContent = `Q: ${revealedInfo.questionText} A: ${revealedInfo.answer}`;
            revealedHistoryEl.appendChild(listItem);
            revealedHistoryEl.scrollTop = revealedHistoryEl.scrollHeight; // Scroll to bottom
        }
        
        guessInputEl.value = ''; // Clear input after reveal or guess attempt

        if (gameState.gameOver) {
            revealNextBtn.disabled = true;
            submitGuessBtn.disabled = true;
            playAgainBtn.classList.remove('hidden');

            if (gameState.gameWon) {
                messageAreaEl.textContent = `You win! The player was ${gameState.secretPlayer.name}.`;
                messageAreaEl.style.color = 'green';
            } else {
                messageAreaEl.textContent = `Game Over! The player was ${gameState.secretPlayer.name}.`;
                messageAreaEl.style.color = '#e74c3c'; // Default error color
            }
        } else {
            revealNextBtn.disabled = gameState.guessesLeft <= 0;
            submitGuessBtn.disabled = false;
            playAgainBtn.classList.add('hidden');
        }
    }

    revealNextBtn.addEventListener('click', () => {
        if (!currentGameState || currentGameState.gameOver) return;

        const { updatedGameState, revealedQuestionText, revealedAnswer } = MLB21QuestionsGame.revealNextAnswer(currentGameState);
        currentGameState = updatedGameState;
        
        if (revealedQuestionText && revealedAnswer) {
            renderUI(currentGameState, { questionText: revealedQuestionText, answer: revealedAnswer });
        } else {
            renderUI(currentGameState); // Render to update button states if no more questions/guesses
        }
    });

    submitGuessBtn.addEventListener('click', () => {
        if (!currentGameState || currentGameState.gameOver) return;

        const guessedName = guessInputEl.value.trim();
        if (!guessedName) {
            messageAreaEl.textContent = 'Please enter a player\'s name.';
            messageAreaEl.style.color = '#e74c3c';
            return;
        }

        const { updatedGameState, correctGuess } = MLB21QuestionsGame.makeGuess(currentGameState, guessedName);
        currentGameState = updatedGameState;

        if (currentGameState.gameOver) {
            if (correctGuess) { // Game won
                messageAreaEl.textContent = `Correct! You win! The player was ${currentGameState.secretPlayer.name}.`;
                messageAreaEl.style.color = 'green';
            } else { // Game lost (either by incorrect guess with 0 guessesLeft or final incorrect guess)
                 messageAreaEl.textContent = `Incorrect guess. Game Over! The player was ${currentGameState.secretPlayer.name}.`;
                 messageAreaEl.style.color = '#e74c3c';
            }
        } else { // Game not over, incorrect guess
            messageAreaEl.textContent = 'Incorrect guess. Try again or reveal more clues.';
            messageAreaEl.style.color = '#e74c3c';
        }
        renderUI(currentGameState);
    });

    playAgainBtn.addEventListener('click', () => {
        messageAreaEl.style.color = '#e74c3c'; // Reset to default error/message color
        startGame();
    });

    // Initial call to start the game
    startGame();
});
