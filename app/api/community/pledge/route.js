// app/api/community/pledge/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    await dbConnect();
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { communityName } = await request.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        if (user.community === communityName) {
            return NextResponse.json({ message: `You are already a member of ${communityName.toUpperCase()}.` }, { status: 400 });
        }

        if (user.allegianceChangesLeft <= 0) {
            return NextResponse.json({ message: 'You have no allegiance changes left.' }, { status: 403 });
        }

        user.community = communityName;
        // Only decrement if they are changing from a non-null community
        if (user.community !== null) { 
            user.allegianceChangesLeft -= 1;
        }
        await user.save();

        return NextResponse.json({ 
            message: `Successfully pledged allegiance to ${communityName.toUpperCase()}!`,
            allegianceChangesLeft: user.allegianceChangesLeft
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Pledge failed:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
