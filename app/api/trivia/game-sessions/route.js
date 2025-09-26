// app/api/trivia/game-sessions/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameSession from '@/models/GameSession';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
    await dbConnect();
    try {
        const adminUser = await requireAdmin(); // Secure the route
        const { title, questions } = await request.json();

        // Basic validation
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
            // Status defaults to 'pending'
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
