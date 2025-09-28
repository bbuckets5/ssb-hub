// components/DailyQuestion.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaGame.css';

export default function DailyQuestion() {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnswered, setIsAnswered] = useState(false); // New state to lock the question

  useEffect(() => {
    const getDailyState = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch the daily question and the user's answer status at the same time
        const [questionRes, answerRes] = await Promise.all([
          fetch('/api/trivia/daily-question'),
          fetch('/api/trivia/daily-answer', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })
        ]);

        if (!questionRes.ok) {
            const errData = await questionRes.json();
            throw new Error(errData.message || 'Could not load the daily question.');
        }
        const questionData = await questionRes.json();
        setQuestion(questionData);

        // If an answer for today already exists, show the result
        if (answerRes.ok) {
            const answerData = await answerRes.json();
            setIsAnswered(true);
            if (answerData.wasCorrect) {
                setFeedback(`You already answered correctly today! +${answerData.raxAwarded} Rax`);
            } else {
                // To get the correct answer text, we need to find it in the question's options
                const correctAnswerText = questionData.options.find(opt => opt === questionData.correctAnswer);
                setFeedback(`You already answered today. The correct answer was: ${correctAnswerText}`);
            }
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    getDailyState();
  }, []);

  const handleAnswerClick = async (option) => {
    setIsAnswered(true); // Lock the buttons immediately
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('You must be logged in to answer.');
        }

        const res = await fetch('/api/trivia/daily-answer', {
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
            throw new Error(data.message);
        }

        // Set feedback based on the API response
        if (data.isCorrect) {
            setFeedback(`Correct! +${data.raxAwarded} Rax!`);
        } else {
            setFeedback(`Wrong! The correct answer was: ${data.correctAnswer}`);
        }
        
        // Refresh the page after a short delay to update Rax in header
        setTimeout(() => window.location.reload(), 2000);

    } catch (err) {
        setFeedback(err.message);
    }
  };

  if (isLoading) {
    return <div className="trivia-container"><p className="loading-text">Loading question of the day...</p></div>;
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
            disabled={isAnswered} // Buttons are disabled if the question has been answered
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
