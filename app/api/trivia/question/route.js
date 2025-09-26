// app/api/trivia/question/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
// We'll create this auth helper later to ensure only logged-in users can play
// import { requireAuth } from '@/lib/auth';

export async function GET() {
    await dbConnect();
    try {
        // In the future, we'll uncomment this to protect the route
        // const user = await requireAuth();

        // Use MongoDB's aggregation pipeline to get 1 random document
        const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);

        if (!randomQuestion || randomQuestion.length === 0) {
            return NextResponse.json({ message: 'No questions found.' }, { status: 404 });
        }

        return NextResponse.json(randomQuestion[0], { status: 200 });

    } catch (error) {
        console.error("Failed to fetch question:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
