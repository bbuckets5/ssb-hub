// app/api/trivia/game-sessions/[sessionId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameSession from '@/models/GameSession';
import Question from '@/models/Question';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET a single game session
export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { sessionId } = params;
        const gameSession = await GameSession.findById(sessionId)
            .populate('questions')
            .populate('createdBy', 'username');

        if (!gameSession) {
            return NextResponse.json({ message: 'Game session not found.' }, { status: 404 });
        }
        return NextResponse.json(gameSession, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch game session:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

// --- NEW: PATCH function to update a game's status (e.g., start or end it) ---
export async function PATCH(request, { params }) {
    await dbConnect();
    try {
        await requireAdmin(); // Secure for admins only
        const { sessionId } = params;
        const { status } = await request.json();

        if (!['active', 'finished'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }

        const gameSession = await GameSession.findById(sessionId);
        if (!gameSession) {
            return NextResponse.json({ message: 'Game session not found.' }, { status: 404 });
        }

        // Add logic to prevent invalid status changes
        if (gameSession.status === 'pending' && status === 'finished') {
            return NextResponse.json({ message: 'Cannot finish a game that has not been started.' }, { status: 400 });
        }
        if (gameSession.status === 'finished') {
            return NextResponse.json({ message: 'This game has already finished.' }, { status: 400 });
        }

        gameSession.status = status;
        await gameSession.save();

        return NextResponse.json({ 
            message: `Game session status updated to ${status}.`,
            gameSession
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to update game session status:", error);
        if (error.message.includes('Forbidden')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
