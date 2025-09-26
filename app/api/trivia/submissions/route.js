// app/api/trivia/submissions/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { requireAdmin } from '@/lib/auth'; // Now imports our real helper

export async function GET(request) {
    await dbConnect();
    try {
        // This line now provides proper security for this route
        await requireAdmin();

        const pendingQuestions = await Question.find({ status: 'pending' })
            .populate('submittedBy', 'username')
            .sort({ createdAt: -1 });

        return NextResponse.json(pendingQuestions, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        // Handle unauthorized errors from our helper
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
