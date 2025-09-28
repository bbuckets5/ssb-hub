// components/admin/TriviaManager.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaManager.css';

// A separate component for the Edit Modal
function EditQuestionModal({ question, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...question });

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    if (formData.correctAnswer === question.options[index]) {
      setFormData({ ...formData, options: newOptions, correctAnswer: value });
    } else {
      setFormData({ ...formData, options: newOptions });
    }
  };
  
  const handleCorrectAnswerChange = (option) => {
    setFormData({ ...formData, correctAnswer: option });
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Trivia Question</h2>
        <form onSubmit={handleSaveChanges}>
          <div className="form-group">
            <label htmlFor="questionText">Question</label>
            <input
              type="text"
              id="questionText"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Answer Options (Mark the correct one)</label>
            <div className="options-grid">
              {formData.options.map((option, index) => (
                <div key={index} className="option-input-group">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === option}
                    onChange={() => handleCorrectAnswerChange(option)}
                    required
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-button primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function TriviaManager() {
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState(null);

  const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [isLoadingApproved, setIsLoadingApproved] = useState(true);
  const [errorApproved, setErrorApproved] = useState(null);
  
  const [processingId, setProcessingId] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [gameTitle, setGameTitle] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameCreationMessage, setGameCreationMessage] = useState('');

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setIsLoadingPending(true);
      setIsLoadingApproved(true);
      const token = localStorage.getItem('authToken');
      
      try {
        const [pendingRes, approvedRes] = await Promise.all([
          fetch('/api/trivia/admin-questions?status=pending', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/trivia/admin-questions?status=approved', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!pendingRes.ok) throw new Error('Failed to fetch pending questions.');
        if (!approvedRes.ok) throw new Error('Failed to fetch approved questions.');

        setPendingQuestions(await pendingRes.json());
        setApprovedQuestions(await approvedRes.json());

      } catch (err) {
        setErrorPending(err.message);
        setErrorApproved(err.message);
      } finally {
        setIsLoadingPending(false);
        setIsLoadingApproved(false);
      }
    };
    
    fetchAllQuestions();
  }, []);

  const handleUpdateStatus = async (questionId, status) => {
    setProcessingId(questionId);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/trivia/submissions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Failed to ${status} question.`);
      }
      
      const movedQuestion = pendingQuestions.find(q => q._id === questionId);
      setPendingQuestions(current => current.filter(q => q._id !== questionId));
      if (status === 'approved' && movedQuestion) {
        setApprovedQuestions(current => [movedQuestion, ...current].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prevSelected => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter(id => id !== questionId);
      } else {
        return [...prevSelected, questionId];
      }
    });
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!gameTitle.trim() || selectedQuestions.length === 0) {
      setGameCreationMessage('Please provide a title and select at least one question.');
      return;
    }
    
    setIsCreatingGame(true);
    setGameCreationMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/trivia/game-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: gameTitle,
          questions: selectedQuestions
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create game session.');
      }

      setGameCreationMessage('Game created successfully!');
      setGameTitle('');
      setSelectedQuestions([]);
      
    } catch (err) {
      setGameCreationMessage(`Error: ${err.message}`);
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleSaveChanges = async (updatedQuestion) => {
    setProcessingId(updatedQuestion._id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/trivia/admin-questions/${updatedQuestion._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedQuestion)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save changes.');
      }

      const savedQuestion = await res.json();
      
      setPendingQuestions(current => 
        current.map(q => q._id === savedQuestion._id ? savedQuestion : q)
      );
      setEditingQuestion(null);

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
        setProcessingId(null);
    }
  };

  if (isLoadingPending || isLoadingApproved) return <p>Loading questions...</p>;
  if (errorPending || errorApproved) return <p className="error-text">Error: {errorPending || errorApproved}</p>;

  return (
    <div className="trivia-manager">
      <h2>Trivia Submission Queue</h2>
      {pendingQuestions.length === 0 ? (
        <p>No pending questions for review.</p>
      ) : (
        <div className="submissions-list">
          {pendingQuestions.map((q) => (
            <div key={q._id} className="submission-card">
              <p className="submission-question">&quot;{q.questionText}&quot;</p>
              <ul className="submission-options">{q.options.map((option, i) => (<li key={i} className={option === q.correctAnswer ? 'correct' : ''}>{option}</li>))}</ul>
              <p className="submitted-by">Submitted by: {q.submittedBy?.username || 'Unknown'}</p>
              <div className="submission-actions">
                <button className="edit-btn" onClick={() => setEditingQuestion(q)} disabled={processingId === q._id}>Edit</button>
                <button className="deny-btn" onClick={() => handleUpdateStatus(q._id, 'denied')} disabled={processingId === q._id}>Deny</button>
                <button className="approve-btn" onClick={() => handleUpdateStatus(q._id, 'approved')} disabled={processingId === q._id}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Approved Question Bank</h2>
      {approvedQuestions.length === 0 ? <p>No approved questions yet.</p> : (
        <form onSubmit={handleCreateGame}>
          <div className="approved-list">
            {approvedQuestions.map((q) => (
              <label key={q._id} className="approved-card selectable">
                <input 
                  type="checkbox"
                  checked={selectedQuestions.includes(q._id)}
                  onChange={() => handleQuestionSelect(q._id)}
                />
                <div className="question-details">
                  <p className="approved-question-text">{q.questionText}</p>
                  <p className="approved-submitted-by">Submitted by: {q.submittedBy?.username || 'Unknown'}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="create-game-section glass">
            <h3>Create New Game Session</h3>
            <p>{selectedQuestions.length} questions selected</p>
            <div className="form-group">
              <label htmlFor="gameTitle">Game Title</label>
              <input
                type="text"
                id="gameTitle"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="e.g., Friday Night Trivia"
              />
            </div>
            <button 
              type="submit" 
              className="cta-button"
              disabled={isCreatingGame || !gameTitle.trim() || selectedQuestions.length === 0}
            >
              {isCreatingGame ? 'Creating...' : 'Create Game'}
            </button>
            {gameCreationMessage && <p style={{marginTop: '1rem'}}>{gameCreationMessage}</p>}
          </div>
        </form>
      )}

      {editingQuestion && (
        <EditQuestionModal 
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
}
