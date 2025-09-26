// components/TriviaGame.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaGame.css';

export default function TriviaGame() {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false); // To disable buttons during API call
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

  // This function now calls our API to check the answer
  const handleAnswerClick = async (option) => {
    setSelectedAnswer(option);
    setIsAnswering(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to play.');
      }

      const res = await fetch('/api/trivia/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: question._id,
          selectedAnswer: option
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit answer.');
      }

      // Set feedback based on the API response
      if (data.isCorrect) {
        setFeedback(`Correct! +${data.raxAwarded} Rax!`);
      } else {
        setFeedback(`Wrong! The correct answer was: ${data.correctAnswer}`);
      }

    } catch (err) {
      setFeedback(err.message);
    } finally {
      setIsAnswering(false);
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
            disabled={!!selectedAnswer || isAnswering}
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && (
        <div className="feedback-container">
          <p className="feedback-text">{feedback}</p>
          <button className="next-button" onClick={fetchQuestion} disabled={isAnswering}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );

}