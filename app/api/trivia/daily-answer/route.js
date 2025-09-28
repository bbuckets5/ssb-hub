// app/api/trivia/daily-answer/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Question from '@/models/Question';
import DailyAnswer from '@/models/DailyAnswer';

const RAX_FOR_DAILY_QUESTION = 25;

// A helper function to get today's date as a YYYY-MM-DD string
const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// GET: Check if the user has already answered today
export async function GET(request) {
    await dbConnect();
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json(null); // No user logged in
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const today = getTodayDateString();

        const existingAnswer = await DailyAnswer.findOne({ userId, date: today });
        if (!existingAnswer) {
            return NextResponse.json({ message: 'No answer found for today.' }, { status: 404 });
        }

        return NextResponse.json(existingAnswer, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}


// POST: Submit an answer for today's question
export async function POST(request) {
    await dbConnect();
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { questionId, selectedAnswer } = await request.json();
        const today = getTodayDateString();

        const existingAnswer = await DailyAnswer.findOne({ userId, date: today });
        if (existingAnswer) {
            return NextResponse.json({ message: "You've already answered the question of the day." }, { status: 409 });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json({ message: 'Question not found.' }, { status: 404 });
        }

        const isCorrect = question.correctAnswer === selectedAnswer;
        let raxAwarded = 0;

        if (isCorrect) {
            raxAwarded = RAX_FOR_DAILY_QUESTION;
            await User.findByIdAndUpdate(userId, { $inc: { rax: raxAwarded } });
        }

        const newAnswer = new DailyAnswer({
            userId,
            questionId,
            date: today,
            selectedAnswer,
            wasCorrect: isCorrect,
            raxAwarded,
        });
        await newAnswer.save();

        return NextResponse.json({
            isCorrect,
            correctAnswer: question.correctAnswer,
            raxAwarded,
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to submit daily answer:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
