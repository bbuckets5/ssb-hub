// app/api/trivia/answer/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Question from '@/models/Question';

const RAX_FOR_CORRECT_ANSWER = 50;

export async function POST(request) {
    await dbConnect();

    try {
        // 1. Authenticate the user and get their ID
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 2. Get the question ID and the user's selected answer from the request
        const { questionId, selectedAnswer } = await request.json();

        // 3. Find the question in the database
        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json({ message: 'Question not found.' }, { status: 404 });
        }

        // 4. Check if the answer is correct
        const isCorrect = question.correctAnswer === selectedAnswer;

        if (isCorrect) {
            // 5. If correct, award Rax to the user
            await User.findByIdAndUpdate(userId, { $inc: { rax: RAX_FOR_CORRECT_ANSWER } });
        }

        // 6. Send a response back to the game
        return NextResponse.json({
            isCorrect: isCorrect,
            correctAnswer: question.correctAnswer,
            raxAwarded: isCorrect ? RAX_FOR_CORRECT_ANSWER : 0
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to check answer:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
 