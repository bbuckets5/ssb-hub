// components/TriviaGame.js
'use client';

import { useState } from 'react';
import './TriviaGame.css';

// A placeholder question to build our UI
const mockQuestion = {
  question: "Which streamer is the leader of the ARL community?",
  options: ["Cheesur", "Adin Ross", "Cuffem", "N3on"],
  correctAnswer: "Adin Ross",
};

export default function TriviaGame() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    // For now, just show an alert. Later, we'll check if it's correct.
    alert(`You selected: ${option}`);
  };

  return (
    <div className="trivia-container">
      <div className="trivia-question">
        <p>{mockQuestion.question}</p>
      </div>
      <div className="trivia-answers">
        {mockQuestion.options.map((option) => (
          <button
            key={option}
            className="answer-button"
            onClick={() => handleAnswerClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
