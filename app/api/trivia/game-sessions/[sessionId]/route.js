// app/api/trivia/game-sessions/[sessionId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameSession from '@/models/GameSession';
import Question from '@/models/Question'; // Needed for the populate to work
import User from '@/models/User'; // Needed for the populate to work

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { sessionId } = params;

        // Note: We are not adding admin-only security here yet,
        // so logged-in users can fetch the game to play it.

        const gameSession = await GameSession.findById(sessionId)
            .populate('questions') // This is the key part: it gets all the question data
            .populate('createdBy', 'username'); // Get the admin's username

        if (!gameSession) {
            return NextResponse.json({ message: 'Game session not found.' }, { status: 404 });
        }

        return NextResponse.json(gameSession, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch game session:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
