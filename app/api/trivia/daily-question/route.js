// app/api/trivia/daily-question/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';

export async function GET() {
    await dbConnect();
    try {
        // Find all questions that have been approved by the admin
        const approvedQuestions = await Question.find({ status: 'approved' });

        if (!approvedQuestions || approvedQuestions.length === 0) {
            return NextResponse.json({ message: 'No approved questions available for the daily challenge.' }, { status: 404 });
        }

        // --- Deterministic Daily Selection Logic ---
        // This logic ensures the same question is picked for the entire day
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const questionIndex = dayOfYear % approvedQuestions.length;
        // ------------------------------------------
        
        const dailyQuestion = approvedQuestions[questionIndex];

        return NextResponse.json(dailyQuestion, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch daily question:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
