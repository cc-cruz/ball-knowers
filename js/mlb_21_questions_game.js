const MLB21QuestionsGame = {
  async loadGameData(filePath = 'data/mlb_21_data.json') {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.players || !data.questions) {
        throw new Error('Invalid data structure in JSON file.');
      }
      return data; // { players: [], questions: [] }
    } catch (error) {
      console.error("Error loading game data:", error);
      // In a real UI, you might want to display this error to the user
      return null; // Or throw the error to be handled by the caller
    }
  },

  initializeGame(players, questions) {
    if (!players || players.length === 0 || !questions || questions.length === 0) {
      console.error("Invalid players or questions data for game initialization.");
      return null; // Or throw an error
    }

    const secretPlayer = players[Math.floor(Math.random() * players.length)];
    
    // Shuffle questions (create a copy to avoid modifying the original array if it's used elsewhere)
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    const gameState = {
      secretPlayer: secretPlayer,
      questions: shuffledQuestions,
      guessesLeft: 21,
      currentQuestionIndex: 0,
      gameOver: false,
      gameWon: false,
      revealedAnswers: [], // To store { questionText: string, answer: "Yes" | "No" }
    };

    return gameState;
  },

  revealNextAnswer(gameState) {
    if (!gameState || gameState.gameOver) {
      return { updatedGameState: gameState, revealedQuestion: null, revealedAnswer: null };
    }

    if (gameState.currentQuestionIndex >= gameState.questions.length || gameState.guessesLeft <= 0) {
      // No more questions to reveal or no guesses left
      if (gameState.guessesLeft <= 0 && !gameState.gameWon) {
        gameState.gameOver = true;
        gameState.gameWon = false;
      }
      return { updatedGameState: gameState, revealedQuestion: null, revealedAnswer: null };
    }

    const question = gameState.questions[gameState.currentQuestionIndex];
    const playerAttributeValue = gameState.secretPlayer[question.attribute];

    let answer;
    // Check for null/undefined playerAttributeValue if the attribute might not exist on all players (e.g. 'era' for non-pitchers)
    if (playerAttributeValue === undefined && question.expectedValue !== undefined) {
        // If the attribute is undefined on the player, it cannot match a defined expectedValue
        // (unless expectedValue is also undefined, which would be a match)
        answer = "No"; 
    } else if (playerAttributeValue === null && question.expectedValue !== null) {
        // Similar logic for null - if player has null for an attribute, 
        // it only matches if expectedValue is also null.
        // Example: player.era is null, question.expectedValue is "sub-3.00" -> No
        // Example: player.era is null, question.expectedValue is null -> Yes
         answer = (question.expectedValue === null) ? "Yes" : "No";
    }
    else {
        answer = (playerAttributeValue === question.expectedValue) ? "Yes" : "No";
    }


    gameState.revealedAnswers.push({
      questionText: question.text,
      answer: answer,
    });

    gameState.guessesLeft -= 1;
    gameState.currentQuestionIndex += 1;

    if (gameState.guessesLeft <= 0 && !gameState.gameWon) {
      gameState.gameOver = true;
      gameState.gameWon = false;
    }

    return {
      updatedGameState: gameState,
      revealedQuestionText: question.text,
      revealedAnswer: answer,
    };
  },

  makeGuess(gameState, guessedName) {
    if (!gameState || gameState.gameOver) {
      return { updatedGameState: gameState, correctGuess: gameState.gameWon };
    }

    let correct = false;
    if (guessedName && gameState.secretPlayer.name) {
        correct = guessedName.trim().toLowerCase() === gameState.secretPlayer.name.toLowerCase();
    }

    if (correct) {
      gameState.gameOver = true;
      gameState.gameWon = true;
    } else {
      // If an incorrect guess is made and no guesses are left (e.g., after all 21 questions revealed)
      // then it's game over, loss.
      // The problem statement: "guesses don't decrement guessesLeft unless it's the only way to end the game..."
      // This implies if guessesLeft is 0, an incorrect guess means game over.
      if (gameState.guessesLeft <= 0) {
        gameState.gameOver = true;
        gameState.gameWon = false;
      }
      // Otherwise, an incorrect guess doesn't end the game if there are still questions/guesses left.
      // The game primarily ends by running out of guesses (via revealNextAnswer) or a correct guess.
    }

    return {
      updatedGameState: gameState,
      correctGuess: correct,
    };
  },
};

// For environments that support module exports (e.g., Node.js for testing, or bundlers like Webpack/Rollup)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MLB21QuestionsGame;
}
// If running in a browser, MLB21QuestionsGame will be a global object (or can be attached to window explicitly)
// window.MLB21QuestionsGame = MLB21QuestionsGame;
