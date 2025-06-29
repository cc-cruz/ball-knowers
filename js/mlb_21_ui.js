document.addEventListener('DOMContentLoaded', () => {
    // Check if MLB21QuestionsGame is loaded
    if (typeof MLB21QuestionsGame === 'undefined') {
        console.error('MLB21QuestionsGame script not loaded!');
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.textContent = 'Critical error: Game logic is missing. Please refresh or contact support.';
            messageArea.className = 'mlb-message-area error';
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
    const currentClueNumberEl = document.getElementById('current-clue-number');

    let currentGameState;
    let clueCounter = 0;

    async function startGame() {
        messageAreaEl.textContent = 'Loading game data...';
        messageAreaEl.className = 'mlb-message-area info';
        revealNextBtn.disabled = true;
        submitGuessBtn.disabled = true;
        playAgainBtn.classList.add('hidden');
        clueCounter = 0;

        try {
            const gameData = await MLB21QuestionsGame.loadGameData('data/mlb_21_data.json');
            if (!gameData || !gameData.players || !gameData.questions) {
                messageAreaEl.textContent = 'Failed to load game data. Please try refreshing.';
                messageAreaEl.className = 'mlb-message-area error';
                return;
            }

            currentGameState = MLB21QuestionsGame.initializeGame(gameData.players, gameData.questions);
            if (!currentGameState) {
                messageAreaEl.textContent = 'Failed to initialize game. Please try refreshing.';
                messageAreaEl.className = 'mlb-message-area error';
                return;
            }

            revealedHistoryEl.innerHTML = '';
            guessInputEl.value = '';
            messageAreaEl.textContent = 'Game loaded! Click "Reveal Next Clue" to start discovering clues about the mystery player.';
            messageAreaEl.className = 'mlb-message-area info';
            
            if(currentClueNumberEl) {
                currentClueNumberEl.textContent = '0';
            }
            renderUI(currentGameState);

        } catch (error) {
            console.error("Error starting game:", error);
            messageAreaEl.textContent = 'Error starting game. Check console for details.';
            messageAreaEl.className = 'mlb-message-area error';
        }
    }

    function renderUI(gameState, revealedInfo) {
        if (!gameState) return;

        guessesLeftCountEl.textContent = gameState.guessesLeft;
        if(currentClueNumberEl) {
            currentClueNumberEl.textContent = gameState.currentQuestionIndex;
        }

        if (revealedInfo && revealedInfo.questionText && revealedInfo.answer) {
            clueCounter++;
            const listItem = document.createElement('li');
            
            // Create clue structure
            const clueIcon = document.createElement('div');
            clueIcon.className = 'mlb-clue-icon';
            clueIcon.textContent = clueCounter;
            
            const clueText = document.createElement('div');
            clueText.className = 'mlb-clue-text';
            clueText.textContent = revealedInfo.questionText;
            
            const answerSpan = document.createElement('span');
            answerSpan.className = `mlb-answer ${revealedInfo.answer.toLowerCase()}`;
            answerSpan.textContent = revealedInfo.answer;
            
            listItem.appendChild(clueIcon);
            listItem.appendChild(clueText);
            listItem.appendChild(answerSpan);
            
            revealedHistoryEl.appendChild(listItem);
            revealedHistoryEl.scrollTop = revealedHistoryEl.scrollHeight;
            
            // Clear message area after revealing a clue
            if (!gameState.gameOver) {
                messageAreaEl.textContent = '';
                messageAreaEl.className = 'mlb-message-area';
            }
        }
        
        guessInputEl.value = '';

        if (gameState.gameOver) {
            revealNextBtn.disabled = true;
            submitGuessBtn.disabled = true;
            playAgainBtn.classList.remove('hidden');

            if (gameState.gameWon) {
                messageAreaEl.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2rem;">🎉</span>
                        <div>
                            <div style="font-size: 1.2rem; margin-bottom: 4px;">Congratulations!</div>
                            <div>You correctly guessed <strong>${gameState.secretPlayer.name}</strong>!</div>
                        </div>
                    </div>
                `;
                messageAreaEl.className = 'mlb-message-area success';
            } else {
                messageAreaEl.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2rem;">😔</span>
                        <div>
                            <div style="font-size: 1.2rem; margin-bottom: 4px;">Game Over!</div>
                            <div>The mystery player was <strong>${gameState.secretPlayer.name}</strong>.</div>
                        </div>
                    </div>
                `;
                messageAreaEl.className = 'mlb-message-area error';
            }
        } else {
            revealNextBtn.disabled = gameState.guessesLeft <= 0;
            submitGuessBtn.disabled = false;
            playAgainBtn.classList.add('hidden');
        }

        // Update button text based on remaining clues
        if (!gameState.gameOver) {
            const remainingClues = gameState.questions.length - gameState.currentQuestionIndex;
            if (remainingClues > 0) {
                revealNextBtn.innerHTML = `🎯 Reveal Next Clue (${remainingClues} remaining)`;
            } else {
                revealNextBtn.innerHTML = '🎯 No more clues available';
            }
        }
    }

    revealNextBtn.addEventListener('click', () => {
        if (!currentGameState || currentGameState.gameOver) return;

        const { updatedGameState, revealedQuestionText, revealedAnswer } = MLB21QuestionsGame.revealNextAnswer(currentGameState);
        currentGameState = updatedGameState;
        
        if (revealedQuestionText && revealedAnswer) {
            renderUI(currentGameState, { questionText: revealedQuestionText, answer: revealedAnswer });
        } else {
            renderUI(currentGameState);
        }
    });

    submitGuessBtn.addEventListener('click', () => {
        if (!currentGameState || currentGameState.gameOver) return;

        const guessedName = guessInputEl.value.trim();
        if (!guessedName) {
            messageAreaEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">⚠️</span>
                    <div>Please enter a player's name before submitting your guess.</div>
                </div>
            `;
            messageAreaEl.className = 'mlb-message-area error';
            guessInputEl.focus();
            return;
        }

        const { updatedGameState, correctGuess } = MLB21QuestionsGame.makeGuess(currentGameState, guessedName);
        currentGameState = updatedGameState;

        if (currentGameState.gameOver) {
            if (correctGuess) {
                // Success message will be handled in renderUI
            } else {
                // Error message will be handled in renderUI
            }
        } else {
            messageAreaEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">❌</span>
                    <div>
                        <div style="font-size: 1.1rem; margin-bottom: 4px;">Incorrect guess!</div>
                        <div>That's not the right player. Try revealing more clues or make another guess.</div>
                    </div>
                </div>
            `;
            messageAreaEl.className = 'mlb-message-area error';
        }
        renderUI(currentGameState);
    });

    // Enhanced enter key support for guess input
    guessInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitGuessBtn.disabled) {
            submitGuessBtn.click();
        }
    });

    playAgainBtn.addEventListener('click', () => {
        messageAreaEl.className = 'mlb-message-area';
        clueCounter = 0;
        startGame();
    });

    // Initial call to start the game
    startGame();
});