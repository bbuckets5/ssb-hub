// components/QuestionForm.js
'use client';

import { useState } from 'react';
import './QuestionForm.css';

export default function QuestionForm() {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('You must be logged in to submit a question.');
        }

        const res = await fetch('/api/trivia/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ questionText, options, correctAnswer })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to submit question.');
        }

        setMessage('Question submitted for review successfully!');
        // Reset form on success
        setQuestionText('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');

    } catch (error) {
        setMessage(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="question-form-container glass">
      <h2>Submit a Trivia Question</h2>
      <p>Think of a question only a true fan would know. If approved, you&apos;ll get Rax!</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="questionText">Question</label>
          <input
            type="text"
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Answer Options (Mark the correct one)</label>
          <div className="options-grid">
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="radio"
                  name="correctAnswer"
                  id={`option-${index}`}
                  value={option}
                  checked={correctAnswer === option}
                  onChange={() => setCorrectAnswer(option)}
                  required
                />
                <input
                  type="text"
                  placeholder={`Answer ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="cta-button" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit for Review'}
        </button>
        {message && <p style={{ marginTop: '1rem', fontWeight: '500' }}>{message}</p>}
      </form>
    </div>
  );
}
