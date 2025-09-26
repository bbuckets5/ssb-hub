// app/api/trivia/submissions/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { requireAdmin } from '@/lib/auth'; // We'll create this helper

export async function GET(request) {
    await dbConnect();
    try {
        // First, ensure the user is an admin
        // This is a placeholder for the actual helper logic
        const authHeader = request.headers.get('authorization');
        if (!authHeader) { // Simple check for now
             // In a real app, we'd verify the token and check the user's role
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const pendingQuestions = await Question.find({ status: 'pending' })
            .populate('submittedBy', 'username') // Get the username of the submitter
            .sort({ createdAt: -1 }); // Show the newest submissions first

        return NextResponse.json(pendingQuestions, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
