// app/api/trivia/game-sessions/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameSession from '@/models/GameSession';
import User from '@/models/User'; // Needed for populate
import { requireAdmin } from '@/lib/auth';

// --- NEW: GET function to fetch available game sessions ---
export async function GET() {
    await dbConnect();
    try {
        const gameSessions = await GameSession.find({
            status: { $in: ['pending', 'active'] } // Find games that are ready or in progress
        })
        .populate('createdBy', 'username') // Get the admin's username
        .sort({ createdAt: -1 }); // Show the newest games first

        return NextResponse.json(gameSessions, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch game sessions:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}


// POST function to create a new game session
export async function POST(request) {
    await dbConnect();
    try {
        const adminUser = await requireAdmin();
        const { title, questions } = await request.json();

        if (!title || !title.trim()) {
            return NextResponse.json({ message: 'Game session title is required.' }, { status: 400 });
        }
        if (!questions || questions.length === 0) {
            return NextResponse.json({ message: 'You must select at least one question.' }, { status: 400 });
        }

        const newGameSession = new GameSession({
            title: title.trim(),
            questions: questions,
            createdBy: adminUser._id,
        });

        await newGameSession.save();

        return NextResponse.json({ 
            message: 'Game session created successfully!',
            gameSession: newGameSession 
        }, { status: 201 });

    } catch (error) {
        console.error("Failed to create game session:", error);
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
