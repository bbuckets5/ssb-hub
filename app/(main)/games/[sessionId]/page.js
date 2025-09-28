// app/(main)/games/[sessionId]/page.js
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import './GamePlayer.css';

export default function GamePlayerPage({ params }) {
    const { sessionId } = use(params);
    const [gameSession, setGameSession] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) return;
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/trivia/game-sessions/${sessionId}`);
                if (!res.ok) throw new Error('Game session not found.');
                setGameSession(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGame();
    }, [sessionId]);

    const handleAnswerClick = async (option) => {
        setSelectedAnswer(option);
        const currentQuestion = gameSession.questions[currentQuestionIndex];

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('You must be logged in to play.');

            const res = await fetch('/api/trivia/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionId: currentQuestion._id,
                    selectedAnswer: option
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            if (data.isCorrect) {
                setFeedback(`Correct! +${data.raxAwarded} Rax!`);
                setScore(prev => prev + 1);
            } else {
                setFeedback(`Wrong! The correct answer was: ${data.correctAnswer}`);
            }

        } catch (err) {
            setFeedback(err.message);
        }
    };
    
    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setFeedback('');
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (isLoading) return <div className="game-player-container"><p>Loading Game...</p></div>;
    if (error) return <div className="game-player-container"><p className="error-text">{error}</p></div>;
    if (!gameSession) return <div className="game-player-container"><p>Game not found.</p></div>;

    const isGameOver = currentQuestionIndex >= gameSession.questions.length;
    const currentQuestion = !isGameOver ? gameSession.questions[currentQuestionIndex] : null;

    return (
        <div className="game-player-container">
            {isGameOver ? (
                <div className="trivia-container">
                    <h1>Game Over!</h1>
                    <p className="final-score">Your Final Score: {score} / {gameSession.questions.length}</p>
                    <Link href="/games" className="cta-button">Back to Games Lobby</Link>
                </div>
            ) : (
                <div className="trivia-container">
                    <div className="game-progress">
                        Question {currentQuestionIndex + 1} of {gameSession.questions.length}
                    </div>
                    <div className="trivia-question">
                        <p>{currentQuestion.questionText}</p>
                    </div>
                    <div className="trivia-answers">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option}
                                className="answer-button"
                                onClick={() => handleAnswerClick(option)}
                                disabled={!!selectedAnswer}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    {feedback && (
                        <div className="feedback-container">
                            <p className="feedback-text">{feedback}</p>
                            <button className="next-button" onClick={handleNextQuestion}>
                                {currentQuestionIndex === gameSession.questions.length - 1 ? 'Finish Game' : 'Next Question'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
