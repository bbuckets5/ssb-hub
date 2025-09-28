// app/api/clipper/create/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Clip from '@/models/clip';
import User from '@/models/User';

export async function POST(request) {
    await dbConnect();
    try {
        // 1. Authenticate the user
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 2. Get the clip details from the request
        const { vodId, title, startTime, endTime, videoUrl, streamer } = await request.json();

        // 3. Basic validation
        if (!vodId || !title || !videoUrl || !streamer || startTime === undefined || endTime === undefined) {
            return NextResponse.json({ message: 'Missing required clip information.' }, { status: 400 });
        }
        if (endTime <= startTime) {
            return NextResponse.json({ message: 'End time must be after start time.' }, { status: 400 });
        }

        // 4. Create and save the new clip request
        const newClip = new Clip({
            vodId,
            title,
            startTime,
            endTime,
            videoUrl, // Storing these for admin convenience
            streamer, // Storing these for admin convenience
            clippedBy: userId,
            // Status defaults to 'pending' as defined in the model
        });

        await newClip.save();

        return NextResponse.json({ message: 'Clip request submitted successfully!' }, { status: 201 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to create clip request:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
