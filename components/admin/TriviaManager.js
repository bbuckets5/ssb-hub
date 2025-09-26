// components/admin/TriviaManager.js
'use client';

import { useState, useEffect } from 'react';
import './TriviaManager.css';

export default function TriviaManager() {
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState(null);

  const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [isLoadingApproved, setIsLoadingApproved] = useState(true);
  const [errorApproved, setErrorApproved] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  // This function now fetches both lists from our new, unified API
  const fetchAllQuestions = async () => {
    setIsLoadingPending(true);
    setIsLoadingApproved(true);
    const token = localStorage.getItem('authToken');
    
    try {
      // Use Promise.all to fetch both lists at the same time
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
  
  useEffect(() => {
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
      
      // Manually update the lists for an instant UI change
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

  return (
    <div className="trivia-manager">
      <h2>Trivia Submission Queue</h2>
      {isLoadingPending ? <p>Loading submissions...</p> : 
       errorPending ? <p className="error-text">Error: {errorPending}</p> :
       pendingQuestions.length === 0 ? <p>No pending questions for review.</p> : (
        <div className="submissions-list">
          {pendingQuestions.map((q) => (
            <div key={q._id} className="submission-card">
              <p className="submission-question">&quot;{q.questionText}&quot;</p>
              <ul className="submission-options">{q.options.map((option, i) => (<li key={i} className={option === q.correctAnswer ? 'correct' : ''}>{option}</li>))}</ul>
              <p className="submitted-by">Submitted by: {q.submittedBy?.username || 'Unknown'}</p>
              <div className="submission-actions">
                <button className="deny-btn" onClick={() => handleUpdateStatus(q._id, 'denied')} disabled={processingId === q._id}>Deny</button>
                <button className="approve-btn" onClick={() => handleUpdateStatus(q._id, 'approved')} disabled={processingId === q._id}>Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Approved Question Bank</h2>
      {isLoadingApproved ? <p>Loading approved questions...</p> : 
       errorApproved ? <p className="error-text">Error: {errorApproved}</p> :
       approvedQuestions.length === 0 ? <p>No approved questions yet.</p> : (
        <div className="approved-list">
           {approvedQuestions.map((q) => (
            <div key={q._id} className="approved-card">
              <p className="approved-question-text">{q.questionText}</p>
              <p className="approved-submitted-by">Submitted by: {q.submittedBy?.username || 'Unknown'}</p>
            </div>
           ))}
        </div>
       )}
    </div>
  );
}
