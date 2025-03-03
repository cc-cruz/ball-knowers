import React, { useState, useEffect } from 'react';
import './App.css';
import QuizApp from './components/QuizApp';

function App() {
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSports, setAvailableSports] = useState(['mlb', 'nba', 'nfl']);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Create an object to store all sports questions
        const allSportsQuestions = {};
        
        // Fetch MLB questions
        try {
          const mlbResponse = await fetch(`${process.env.PUBLIC_URL}/data/mlb-questions.json`);
          if (mlbResponse.ok) {
            const mlbData = await mlbResponse.json();
            allSportsQuestions.mlb = mlbData;
          } else {
            console.warn('Failed to load MLB questions');
          }
        } catch (mlbError) {
          console.warn('Error loading MLB questions:', mlbError);
        }
        
        // Fetch NBA questions
        try {
          const nbaResponse = await fetch(`${process.env.PUBLIC_URL}/data/nba-questions.json`);
          if (nbaResponse.ok) {
            const nbaData = await nbaResponse.json();
            allSportsQuestions.nba = nbaData;
          } else {
            console.warn('Failed to load NBA questions');
          }
        } catch (nbaError) {
          console.warn('Error loading NBA questions:', nbaError);
        }
        
        // Fetch NFL questions
        try {
          const nflResponse = await fetch(`${process.env.PUBLIC_URL}/data/nfl-questions.json`);
          if (nflResponse.ok) {
            const nflData = await nflResponse.json();
            allSportsQuestions.nfl = nflData;
          } else {
            console.warn('Failed to load NFL questions');
          }
        } catch (nflError) {
          console.warn('Error loading NFL questions:', nflError);
        }
        
        // Fetch NBA Pop Culture questions
        try {
          const nbaPopCultureResponse = await fetch(`${process.env.PUBLIC_URL}/data/nba-pop-culture-questions.json`);
          if (nbaPopCultureResponse.ok) {
            const nbaPopCultureData = await nbaPopCultureResponse.json();
            allSportsQuestions.nbapopculture = nbaPopCultureData;
          } else {
            console.warn('Failed to load NBA Pop Culture questions');
          }
        } catch (nbaPopCultureError) {
          console.warn('Error loading NBA Pop Culture questions:', nbaPopCultureError);
        }
        
        // Fetch NFL Scandal questions
        try {
          const nflScandalResponse = await fetch(`${process.env.PUBLIC_URL}/data/nfl-scandal-questions.json`);
          if (nflScandalResponse.ok) {
            const nflScandalData = await nflScandalResponse.json();
            allSportsQuestions.nflscandal = nflScandalData;
          } else {
            console.warn('Failed to load NFL Scandal questions');
          }
        } catch (nflScandalError) {
          console.warn('Error loading NFL Scandal questions:', nflScandalError);
        }
        
        // Check if we have any questions
        const availableSports = Object.keys(allSportsQuestions).filter(
          sport => allSportsQuestions[sport] && 
                  Object.keys(allSportsQuestions[sport]).length > 0
        );
        
        if (availableSports.length === 0) {
          throw new Error('No question data available for any sport');
        }
        
        setAvailableSports(availableSports);
        setQuestions(allSportsQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  if (loading) {
    return <div className="loading-container">Loading questions...</div>;
  }
  
  return (
    <div className="App">
      <QuizApp 
        questions={questions} 
        error={error} 
        availableSports={availableSports}
      />
    </div>
  );
}

export default App;
