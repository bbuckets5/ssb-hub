// components/QuestionForm.js
'use client';

import { useState } from 'react';
import './QuestionForm.css';

export default function QuestionForm() {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Later, this will call our API
    alert('Question submitted for review!');
    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  return (
    <div className="question-form-container glass">
      <h2>Submit a Trivia Question</h2>
      <p>Think of a question only a true fan would know. If approved, you'll get Rax!</p>
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
        <button type="submit" className="cta-button">Submit for Review</button>
      </form>
    </div>
  );
}
