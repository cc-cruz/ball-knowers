import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSportFeedback } from './SportIcons';
import './QuizApp.css';

// Constants
const TIMER_DURATION = 15;
const TOTAL_QUESTIONS = 10;
const QUESTION_DELAY = 2000;

// Sport display names and colors
const SPORTS_CONFIG = {
  mlb: { 
    name: 'MLB Baseball', 
    color: '#002D72', 
    secondaryColor: '#E4002B',
    icon: '⚾'
  },
  nba: { 
    name: 'NBA Basketball', 
    color: '#17408B', 
    secondaryColor: '#C9082A',
    icon: '🏀'
  },
  nfl: { 
    name: 'NFL Football', 
    color: '#013369', 
    secondaryColor: '#D50A0A',
    icon: '🏈'
  },
  nbapopculture: {
    name: 'NBA Pop Culture',
    color: '#6F2DA8', // Purple color for pop culture
    secondaryColor: '#FFC72C', // Gold color
    icon: '🎬'
  },
  nflscandal: {
    name: 'NFL Scandals',
    color: '#831618', // Dark red for scandals
    secondaryColor: '#000000', // Black
    icon: '📰'
  }
};

const QuizApp = ({ questions, error, availableSports = ['mlb'] }) => {
  // Game states
  const [gameState, setGameState] = useState('welcome'); // welcome, sport, start, playing, result
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [selectedSport, setSelectedSport] = useState(() => {
    // Load sport from localStorage or default to first available
    const savedSport = localStorage.getItem('sports-trivia-selected-sport');
    return savedSport && availableSports.includes(savedSport) 
      ? savedSport 
      : availableSports[0];
  });
  const [difficultyLevel, setDifficultyLevel] = useState(() => {
    // Load difficulty from localStorage or default to 'medium'
    const savedDifficulty = localStorage.getItem('sports-trivia-difficulty');
    return savedDifficulty || 'medium';
  });
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [playerName, setPlayerName] = useState(() => {
    // Load player name from localStorage or default to empty string
    return localStorage.getItem('sports-trivia-player-name') || '';
  });
  const [highScores, setHighScores] = useState(() => {
    // Load high scores from localStorage or default to empty array
    const savedHighScores = localStorage.getItem('sports-trivia-high-scores');
    return savedHighScores ? JSON.parse(savedHighScores) : [];
  });
  const [currentQuestions, setCurrentQuestions] = useState([]);
  
  // Refs for keyboard navigation
  const nameInputRef = useRef(null);
  const startButtonRef = useRef(null);
  const hintButtonRef = useRef(null);
  const restartButtonRef = useRef(null);
  const continueButtonRef = useRef(null);
  const answerButtonsRef = useRef([]);
  const sportButtonsRef = useRef([]);

  // Save player name to localStorage when it changes
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('sports-trivia-player-name', playerName);
    }
  }, [playerName]);

  // Save difficulty preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sports-trivia-difficulty', difficultyLevel);
  }, [difficultyLevel]);
  
  // Save selected sport to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sports-trivia-selected-sport', selectedSport);
  }, [selectedSport]);

  // Define handleAnswer with useCallback to avoid dependency issues
  const handleAnswer = useCallback((answer) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setStreakCount(prevStreak => prevStreak + 1);
      if (streakCount + 1 > highestStreak) {
        setHighestStreak(streakCount + 1);
      }
    } else {
      setStreakCount(0);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(TIMER_DURATION);
        setShowHint(false);
      } else {
        // Game over - update high scores
        const newScore = {
          name: playerName || 'Anonymous',
          score: score + (isCorrect ? 1 : 0),
          difficulty: difficultyLevel,
          sport: selectedSport,
          date: new Date().toISOString()
        };
        
        const updatedHighScores = [...highScores, newScore]
          .sort((a, b) => b.score - a.score)
          .slice(0, 20); // Keep top 20 scores across all sports
        
        setHighScores(updatedHighScores);
        localStorage.setItem('sports-trivia-high-scores', JSON.stringify(updatedHighScores));
        
        setGameState('result');
      }
    }, QUESTION_DELAY);
  }, [
    currentQuestionIndex, 
    currentQuestions, 
    isAnswered,
    score,
    streakCount,
    highestStreak,
    playerName,
    difficultyLevel,
    selectedSport,
    highScores
  ]);

  // Set up questions based on difficulty when game starts
  useEffect(() => {
    if (gameState === 'playing' && questions && questions[selectedSport] && questions[selectedSport][difficultyLevel]) {
      // Get questions for the selected difficulty
      const questionsForDifficulty = questions[selectedSport][difficultyLevel] || [];
      
      // Fisher-Yates shuffle algorithm for better randomization
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      
      // Shuffle and select questions
      const shuffled = shuffleArray(questionsForDifficulty);
      const selected = shuffled.slice(0, Math.min(TOTAL_QUESTIONS, shuffled.length));
      
      setCurrentQuestions(selected);
      setCurrentQuestionIndex(0);
      setTimeLeft(TIMER_DURATION);
      setScore(0);
      setStreakCount(0);
      setHighestStreak(0);
      setHintsUsed(0);
      setShowHint(false);
      setIsAnswered(false);
      setSelectedAnswer(null);
    }
  }, [gameState, difficultyLevel, questions, selectedSport]);

  // Timer countdown with proper cleanup
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isAnswered) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && gameState === 'playing') {
      handleAnswer(null); // Time's up, count as wrong answer
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isAnswered, gameState, handleAnswer]);

  // Add keyboard navigation for the game
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard navigation when not in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Number keys 1-4 for selecting answers
      if (gameState === 'playing' && !isAnswered && e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        const currentQuestion = currentQuestions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.options && index < currentQuestion.options.length) {
          handleAnswer(currentQuestion.options[index]);
        }
      }

      // 'H' key for hint
      if (gameState === 'playing' && !isAnswered && !showHint && e.key.toLowerCase() === 'h') {
        handleShowHint();
      }

      // Space or Enter for primary actions
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'welcome') {
          if (playerName.trim()) {
            setGameState('sport');
          }
        } else if (gameState === 'sport') {
          setGameState('start');
        } else if (gameState === 'start') {
          handleStartGame();
        } else if (gameState === 'result') {
          resetGame();
        }
        // Prevent default to avoid scrolling with space
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, isAnswered, showHint, currentQuestions, currentQuestionIndex, handleAnswer, playerName]);

  // Focus on name input when welcome screen is shown
  useEffect(() => {
    if (gameState === 'welcome' && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [gameState]);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(prevHints => prevHints + 1);
    if (hintButtonRef.current) {
      hintButtonRef.current.focus();
    }
  };

  const resetGame = () => {
    setGameState('sport');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(TIMER_DURATION);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStreakCount(0);
    setHighestStreak(0);
    setShowHint(false);
    setHintsUsed(0);
  };

  const handleChangeDifficulty = (difficulty) => {
    setDifficultyLevel(difficulty);
  };
  
  const handleChangeSport = (sport) => {
    setSelectedSport(sport);
  };

  const showWarningBanner = error && questions && questions[selectedSport] && 
                           questions[selectedSport].easy && 
                           questions[selectedSport].easy.length > 0;

  const renderWelcomeScreen = () => {
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="logo-container">
            <img 
              src={`${process.env.PUBLIC_URL}/images/sports-trivia-logo.svg`} 
              alt="The Ball Knowers Logo" 
              className="app-logo"
            />
          </div>
          
          <h1 className="welcome-title">The Ball Knowers</h1>
          <p className="welcome-subtitle">Think you know ball? Settle the score!</p>
          
          <div className="sports-icons">
            {availableSports.map(sport => (
              <span key={sport} className="sport-icon" title={SPORTS_CONFIG[sport]?.name || sport}>
                {SPORTS_CONFIG[sport]?.icon || '🏆'}
              </span>
            ))}
          </div>
          
          <div className="name-form">
            <div className="form-group">
              <label htmlFor="playerName" className="name-label">Enter Your Name:</label>
              <input
                type="text"
                id="playerName"
                className="name-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your Name"
                aria-label="Your Name"
                maxLength={20}
                ref={nameInputRef}
                autoFocus
              />
            </div>
            <button 
              className="continue-button"
              onClick={() => setGameState('sport')}
              disabled={!playerName.trim()}
              aria-disabled={!playerName.trim()}
              ref={continueButtonRef}
            >
              Continue to Game
            </button>
          </div>
          
          {highScores.length > 0 && (
            <div className="mini-leaderboard">
              <h3>Top Players</h3>
              <ul>
                {highScores.slice(0, 3).map((score, index) => (
                  <li key={index} className="leaderboard-entry">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{score.name || 'Anonymous'}</span>
                    <span className="score">{score.score}</span>
                    <span className="sport">{SPORTS_CONFIG[score.sport]?.icon || '🏆'}</span>
                    <span className="difficulty">{score.difficulty}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderSportSelectionScreen = () => {
    return (
      <div className="sport-selection-screen">
        <h1>The Ball Knowers</h1>
        <p>Welcome, {playerName}! Choose your sport to settle the score:</p>
        
        <div className="sports-grid">
          {availableSports.map((sport, index) => (
            <button
              key={sport}
              className={`sport-button ${selectedSport === sport ? 'selected' : ''}`}
              onClick={() => handleChangeSport(sport)}
              style={{
                '--primary-color': SPORTS_CONFIG[sport]?.color || '#333',
                '--secondary-color': SPORTS_CONFIG[sport]?.secondaryColor || '#666'
              }}
              ref={el => sportButtonsRef.current[index] = el}
            >
              <span className="sport-icon">{SPORTS_CONFIG[sport]?.icon || '🏆'}</span>
              <span className="sport-name">{SPORTS_CONFIG[sport]?.name || sport}</span>
            </button>
          ))}
        </div>
        
        <button 
          className="continue-button"
          onClick={() => setGameState('start')}
        >
          Continue
        </button>
        
        <div className="keyboard-help">
          <p>Use arrow keys to navigate and Enter to select</p>
        </div>
      </div>
    );
  };

  const renderStartScreen = () => {
    return (
      <section className="start-screen">
        <header>
          <div className="sport-header">
            <span className="sport-icon">{SPORTS_CONFIG[selectedSport]?.icon || '🏆'}</span>
            <h1>The Ball Knowers | {SPORTS_CONFIG[selectedSport]?.name || 'Sports'}</h1>
          </div>
          <p>Think you know ball? Settle the score!</p>
          {playerName && <p className="player-greeting">Good luck, {playerName}!</p>}
        </header>
        
        <div className="difficulty-selector">
          <h3>Select Difficulty:</h3>
          <div className="difficulty-buttons" role="group" aria-label="Difficulty selection">
            <button 
              className={difficultyLevel === 'easy' ? 'active' : ''} 
              onClick={() => handleChangeDifficulty('easy')}
              aria-pressed={difficultyLevel === 'easy'}
              ref={el => startButtonRef.current = el}
            >
              Easy
            </button>
            <button 
              className={difficultyLevel === 'medium' ? 'active' : ''} 
              onClick={() => handleChangeDifficulty('medium')}
              aria-pressed={difficultyLevel === 'medium'}
            >
              Medium
            </button>
            <button 
              className={difficultyLevel === 'hard' ? 'active' : ''} 
              onClick={() => handleChangeDifficulty('hard')}
              aria-pressed={difficultyLevel === 'hard'}
            >
              Hard
            </button>
          </div>
        </div>
        
        <button 
          className="start-button" 
          onClick={handleStartGame}
          style={{
            backgroundColor: SPORTS_CONFIG[selectedSport]?.color || '#3498db'
          }}
        >
          Start Game
        </button>
        
        <button 
          className="back-button" 
          onClick={() => setGameState('sport')}
        >
          Change Sport
        </button>
        
        <div className="keyboard-help">
          <p>Press <kbd>Enter</kbd> to start the game</p>
        </div>
      </section>
    );
  };

  const renderPlayingScreen = () => {
    if (!currentQuestions.length || !currentQuestions[currentQuestionIndex]) {
      return <div className="loading">Loading questions...</div>;
    }

    const currentQuestion = currentQuestions[currentQuestionIndex];

    return (
      <section className="game-screen">
        <header className="game-header" style={{ backgroundColor: SPORTS_CONFIG[selectedSport]?.color || '#3498db' }}>
          <div className="sport-indicator">
            <span className="sport-icon">{SPORTS_CONFIG[selectedSport]?.icon || '🏆'}</span>
            <span className="sport-name">{SPORTS_CONFIG[selectedSport]?.name || selectedSport}</span>
          </div>
          <div className="progress">
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </div>
          <div className="score">Score: {score}</div>
          <div className="streak">Streak: {streakCount}</div>
          <div className="timer" aria-live="polite">Time: {timeLeft}s</div>
        </header>
        
        <div className="question-container">
          <h2 className="question-text">{currentQuestion.question}</h2>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`option-button ${isAnswered ? (option === currentQuestion.correctAnswer ? 'correct' : (option === selectedAnswer ? 'incorrect' : '')) : ''}`}
                disabled={isAnswered}
                ref={el => answerButtonsRef.current[index] = el}
                aria-pressed={selectedAnswer === option}
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
          
          {showHint && (
            <div className="hint-text" aria-live="polite">
              <p>{currentQuestion.hint || `This question is about ${SPORTS_CONFIG[selectedSport]?.name || 'sports'}.`}</p>
            </div>
          )}
        </div>
        
        <div className="game-controls">
          {!showHint && !isAnswered && (
            <button 
              className="hint-button" 
              onClick={handleShowHint}
              ref={hintButtonRef}
              disabled={hintsUsed >= 3}
              style={{ backgroundColor: SPORTS_CONFIG[selectedSport]?.secondaryColor || '#e74c3c' }}
            >
              Use Hint ({3 - hintsUsed} left)
            </button>
          )}
        </div>
        
        <div className="keyboard-help">
          <p>Press <kbd>1</kbd>-<kbd>4</kbd> to select an answer, <kbd>H</kbd> to use a hint</p>
        </div>
      </section>
    );
  };

  const renderGameOverScreen = () => {
    const isHighScore = highScores.some(score => 
      score.name === playerName && 
      score.sport === selectedSport
    );
    
    // Filter high scores for the current sport
    const sportHighScores = highScores
      .filter(score => score.sport === selectedSport)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    // Calculate percentage for feedback
    const percentage = (score / currentQuestions.length) * 100;
    const feedback = getSportFeedback(selectedSport, percentage);
    
    return (
      <div className="game-over-screen">
        <h2>The Ball Knowers</h2>
        <p className="player-greeting">Score settled, {playerName}!</p>
        
        <div className="sport-indicator">
          <span className="sport-icon">{SPORTS_CONFIG[selectedSport]?.icon || '🏆'}</span>
          <span className="sport-name">{SPORTS_CONFIG[selectedSport]?.name || selectedSport}</span>
        </div>
        
        <p>Your final score: {score} out of {currentQuestions.length}</p>
        <p>Difficulty: {difficultyLevel}</p>
        
        <p className="feedback-message">{feedback}</p>
        
        {isHighScore && (
          <p className="high-score-message">
            <span role="img" aria-label="trophy">🏆</span> New High Score! <span role="img" aria-label="trophy">🏆</span>
          </p>
        )}
        
        <div className="leaderboard">
          <h2>Leaderboard | {SPORTS_CONFIG[selectedSport]?.name || selectedSport}</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="rank">Rank</div>
              <div className="name">Player</div>
              <div className="score">Score</div>
              <div className="difficulty">Difficulty</div>
            </div>
            {sportHighScores.length > 0 ? (
              sportHighScores.map((highScore, index) => (
                <div 
                  key={index} 
                  className={`leaderboard-row ${highScore.name === playerName ? 'current-player' : ''}`}
                >
                  <div className="rank">#{index + 1}</div>
                  <div className="name">{highScore.name || 'Anonymous'}</div>
                  <div className="score">{highScore.score}</div>
                  <div className="difficulty">{highScore.difficulty}</div>
                </div>
              ))
            ) : (
              <div className="leaderboard-empty">
                <p>No high scores yet for {SPORTS_CONFIG[selectedSport]?.name || selectedSport}. Be the first!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="button-container">
          <button 
            onClick={resetGame} 
            className="reset-button"
            ref={restartButtonRef}
            style={{ backgroundColor: SPORTS_CONFIG[selectedSport]?.color || '#3498db' }}
          >
            Play Again
          </button>
          <button 
            onClick={() => setGameState('sport')} 
            className="menu-button"
          >
            Change Sport
          </button>
        </div>
        
        <div className="keyboard-help">
          <p>Press <kbd>Enter</kbd> to play again</p>
        </div>
      </div>
    );
  };

  return (
    <main className="quiz-container">
      {showWarningBanner && (
        <div className="warning-banner" role="alert">
          {error}
        </div>
      )}
      
      {gameState === 'welcome' && renderWelcomeScreen()}
      
      {gameState === 'sport' && renderSportSelectionScreen()}
      
      {gameState === 'start' && renderStartScreen()}
      
      {gameState === 'playing' && renderPlayingScreen()}
      
      {gameState === 'result' && renderGameOverScreen()}
    </main>
  );
};

export default QuizApp;
