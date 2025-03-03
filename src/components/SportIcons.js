import React from 'react';

// Baseball Icon
export const BaseballIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4.93 4.93C7.64 7.64 16.35 16.35 19.07 19.07" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19.07 4.93C16.36 7.64 7.65 16.35 4.93 19.07" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.5 4 13.5 8 12 12C10.5 16 10.5 20 12 22" stroke="currentColor" strokeWidth="1.5" />
    <path d="M22 12C20 13.5 16 13.5 12 12C8 10.5 4 10.5 2 12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Basketball Icon
export const BasketballIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 2C16.5 6.5 16.5 17.5 12 22" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C7.5 6.5 7.5 17.5 12 22" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 12C6.5 7.5 17.5 7.5 22 12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 12C6.5 16.5 17.5 16.5 22 12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Football Icon
export const FootballIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(45 12 12)" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 8L16 16" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 16L16 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Pop Culture Icon
export const PopCultureIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M8 20H16" stroke="currentColor" strokeWidth="2" />
    <path d="M12 18V20" stroke="currentColor" strokeWidth="2" />
    <path d="M10 9L15 12L10 15V9Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// Scandal/News Icon
export const ScandalIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M3 8H21" stroke="currentColor" strokeWidth="2" />
    <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 15H14" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M18 13V15" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Get sport-specific icon
export const getSportIcon = (sportType) => {
  switch(sportType) {
    case 'nba':
      return <BasketballIcon className="sport-svg-icon" />;
    case 'nfl': 
      return <FootballIcon className="sport-svg-icon" />;
    case 'nbapopculture':
      return <PopCultureIcon className="sport-svg-icon" />;
    case 'nflscandal':
      return <ScandalIcon className="sport-svg-icon" />;
    case 'mlb':
    default:
      return <BaseballIcon className="sport-svg-icon" />;
  }
};

// Get sport title
export const getSportTitle = (sportType) => {
  switch(sportType) {
    case 'nba':
      return "The Ball Knowers | NBA Edition";
    case 'nfl': 
      return "The Ball Knowers | NFL Edition";
    case 'nbapopculture':
      return "The Ball Knowers | NBA Pop Culture";
    case 'nflscandal':
      return "The Ball Knowers | NFL Scandals";
    case 'mlb':
    default:
      return "The Ball Knowers | MLB Edition";
  }
};

// Get sport-specific feedback
export const getSportFeedback = (sportType, percentage) => {
  const sportSpecificFeedback = {
    mlb: {
      excellent: "MLB All-Star! Your baseball knowledge is impressive!",
      good: "Solid performance! You know your baseball facts!",
      average: "Not bad! Keep watching those games to improve!",
      poor: "Rookie status! Time to brush up on your MLB trivia!"
    },
    nba: {
      excellent: "NBA Superstar! Your basketball knowledge is on fire!",
      good: "Playoff-worthy performance! You know your hoops!",
      average: "Bench player status! Keep watching those games!",
      poor: "Draft prospect! Time to study more NBA history!"
    },
    nfl: {
      excellent: "NFL Pro Bowler! Your football knowledge is championship level!",
      good: "Playoff-caliber! You know your football facts!",
      average: "Practice squad level! Keep following the game!",
      poor: "Rookie combine! Time to brush up on your NFL trivia!"
    },
    nbapopculture: {
      excellent: "Hollywood MVP! Your NBA pop culture knowledge is red carpet worthy!",
      good: "Celebrity Row Status! You know your NBA stars off the court!",
      average: "Paparazzi Level! Keep up with those NBA celebrities!",
      poor: "Tabloid Reader! Time to follow more NBA stars on social media!"
    },
    nflscandal: {
      excellent: "Investigative Reporter! Your NFL scandal knowledge is Pulitzer worthy!",
      good: "Sports Columnist! You know your NFL controversies!",
      average: "Twitter Follower! Keep reading those NFL headlines!",
      poor: "Casual Fan! Time to dive deeper into NFL drama!"
    }
  };

  const feedback = sportSpecificFeedback[sportType] || sportSpecificFeedback.mlb;
  
  if (percentage >= 80) return feedback.excellent;
  if (percentage >= 60) return feedback.good;
  if (percentage >= 40) return feedback.average;
  return feedback.poor;
}; 