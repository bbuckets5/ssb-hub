// app/api/users/profile/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
    await dbConnect();

    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // --- MODIFIED: Now also fetches the 'community' field ---
        const user = await User.findById(userId).select('username rax community');
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to fetch profile:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
