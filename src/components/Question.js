import React, { memo } from 'react';
import './Question.css';

const Question = ({ 
  question, 
  options, 
  selectedAnswer, 
  onSelectAnswer, 
  isAnswered, 
  correctAnswer,
  showHint,
  hint,
  image
}) => {
  // Function to generate a placeholder image based on the image key
  const generatePlaceholderImage = (imageKey) => {
    if (!imageKey) return null;
    
    // Create a color based on the image key
    const getColor = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = Math.abs(hash).toString(16).substring(0, 6);
      return color.padStart(6, '0');
    };
    
    const backgroundColor = getColor(imageKey);
    const textColor = 'ffffff';
    const text = imageKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23${backgroundColor}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23${textColor}' text-anchor='middle' dominant-baseline='middle'%3E${text}%3C/text%3E%3C/svg%3E`;
  };

  const imageSrc = generatePlaceholderImage(image);

  return (
    <div className="question-container" role="region" aria-label="Quiz Question">
      {imageSrc && (
        <div className="question-image-container">
          <img 
            src={imageSrc} 
            alt={`Baseball ${image.replace(/-/g, ' ')}`} 
            className="question-image"
          />
        </div>
      )}
      
      <h2 className="question-text" id="current-question">{question}</h2>
      
      {showHint && hint && (
        <div className="hint-container" aria-live="polite">
          <p className="hint-text"><strong>Hint:</strong> {hint}</p>
        </div>
      )}
      
      <div className="options-container" role="group" aria-labelledby="current-question">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${
              selectedAnswer === option
                ? isAnswered
                  ? option === correctAnswer
                    ? 'correct'
                    : 'incorrect'
                  : 'selected'
                : isAnswered && option === correctAnswer
                ? 'correct'
                : ''
            }`}
            onClick={() => !isAnswered && onSelectAnswer(option)}
            disabled={isAnswered}
            aria-pressed={selectedAnswer === option}
            aria-disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Question);
