// app/api/users/leaderboard/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    try {
        const topUsers = await User.find({})
            // --- MODIFIED: Sorting by lifetime earnings ---
            .sort({ raxEarned: -1 }) 
            .limit(10)
            // --- MODIFIED: Added raxEarned to the response ---
            .select('username rax raxEarned community');

        return NextResponse.json(topUsers, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
