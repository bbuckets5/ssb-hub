// components/TriviaGame.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaGame.css';

export default function TriviaGame() {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuestion = async () => {
    setIsLoading(true);
    setError('');
    setFeedback('');
    setSelectedAnswer(null);
    try {
      const res = await fetch('/api/trivia/question');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch question.');
      }
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion(); // Fetch the first question when the component loads
  }, []);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    if (option === question.correctAnswer) {
      setFeedback('Correct!');
      // We will add logic to award Rax here later
    } else {
      setFeedback(`Wrong! The correct answer was: ${question.correctAnswer}`);
    }
  };

  if (isLoading) {
    return <div className="trivia-container"><p className="loading-text">Loading question...</p></div>;
  }
  
  if (error) {
    return <div className="trivia-container"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="trivia-container">
      <div className="trivia-question">
        <p>{question?.questionText}</p>
      </div>
      <div className="trivia-answers">
        {question?.options.map((option) => (
          <button
            key={option}
            className="answer-button"
            onClick={() => handleAnswerClick(option)}
            disabled={!!selectedAnswer} // Disable buttons after an answer is chosen
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && (
        <div className="feedback-container">
          <p className="feedback-text">{feedback}</p>
          <button className="next-button" onClick={fetchQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}
