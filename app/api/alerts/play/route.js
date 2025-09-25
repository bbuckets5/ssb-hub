// app/api/alerts/play/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    await dbConnect();

    try {
        // 1. Get and verify the user's token to get their ID
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 2. Get the cost of the sound from the request
        const { soundCost } = await request.json();
        if (typeof soundCost !== 'number' || soundCost <= 0) {
            return NextResponse.json({ message: 'Invalid sound cost.' }, { status: 400 });
        }

        // 3. Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // 4. Check if the user has enough Rax
        if (user.rax < soundCost) {
            return NextResponse.json({ message: 'Not enough Rax to play this sound!' }, { status: 403 });
        }

        // 5. Atomically deduct the cost and get the updated user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { rax: -soundCost } },
            { new: true } // This option returns the updated document
        );

        // This is where we would trigger the real-time alert on stream in a future step
        
        return NextResponse.json({ 
            message: 'Alert played!',
            newRaxBalance: updatedUser.rax 
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to play alert:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
