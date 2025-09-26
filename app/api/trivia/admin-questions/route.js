// app/api/trivia/admin-questions/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    await dbConnect();
    try {
        await requireAdmin(); // Secure the route for admins only

        // Get the search parameters from the URL (e.g., ?status=approved)
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const filter = {};
        // If a status is provided in the URL, add it to our database query
        if (status) {
            filter.status = status;
        }

        const questions = await Question.find(filter)
            .populate('submittedBy', 'username')
            .sort({ createdAt: -1 });

        return NextResponse.json(questions, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch admin questions:", error);
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
