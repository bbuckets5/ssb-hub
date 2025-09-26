// app/api/trivia/submit/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Question from '@/models/Question';

export async function POST(request) {
    await dbConnect();

    try {
        // 1. Authenticate the user and get their ID
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 2. Get the submitted question data from the request
        const { questionText, options, correctAnswer } = await request.json();

        // 3. Validate the data
        if (!questionText || !options || !correctAnswer) {
            return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }
        if (options.length !== 4 || options.some(opt => !opt.trim())) {
            return NextResponse.json({ message: 'You must provide exactly 4 non-empty answer options.' }, { status: 400 });
        }
        if (!options.includes(correctAnswer)) {
            return NextResponse.json({ message: 'The correct answer must be one of the four options.' }, { status: 400 });
        }

        // 4. Create and save the new question
        const newQuestion = new Question({
            questionText,
            options,
            correctAnswer,
            submittedBy: userId,
            // The 'status' will default to 'pending' as defined in our model
        });

        await newQuestion.save();

        return NextResponse.json({ message: 'Question submitted for review successfully!' }, { status: 201 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to submit question:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
