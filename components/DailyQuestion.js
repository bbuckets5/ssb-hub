// components/DailyQuestion.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaGame.css'; // We can reuse the same styles

export default function DailyQuestion() {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      try {
        const res = await fetch('/api/trivia/daily-question');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch daily question.');
        }
        setQuestion(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDailyQuestion();
  }, []);

  const handleAnswerClick = (option) => {
    if (option === question.correctAnswer) {
      setFeedback('Correct!');
    } else {
      setFeedback(`Wrong! The correct answer was: ${question.correctAnswer}`);
    }
  };

  if (isLoading) {
    return <div className="trivia-container"><p className="loading-text">Loading question...</p></div>;
  }
  
  if (error || !question) {
    return <div className="trivia-container"><p className="error-text">{error || 'No question available today.'}</p></div>;
  }

  return (
    <div className="trivia-container">
      <div className="trivia-question">
        <p>{question.questionText}</p>
      </div>
      <div className="trivia-answers">
        {question.options.map((option) => (
          <button
            key={option}
            className="answer-button"
            onClick={() => handleAnswerClick(option)}
            disabled={!!feedback}
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && (
        <div className="feedback-container">
          <p className="feedback-text">{feedback}</p>
        </div>
      )}
    </div>
  );
}
