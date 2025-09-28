// app/api/clipper/requests/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Clip from '@/models/clip';
import User from '@/models/User'; // Needed for populate
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    await dbConnect();
    try {
        await requireAdmin(); // Secure the route for admins only

        const pendingClips = await Clip.find({ status: 'pending' })
            .populate('clippedBy', 'username') // Get the username of the submitter
            .sort({ createdAt: -1 }); // Show the newest requests first

        return NextResponse.json(pendingClips, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch clip requests:", error);
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
