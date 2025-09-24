// app/api/community/counts/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    try {
        const ytgCount = await User.countDocuments({ community: 'ytg' });
        const bauCount = await User.countDocuments({ community: 'bau' });
        const arlCount = await User.countDocuments({ community: 'arl' });

        return NextResponse.json({
            ytg: ytgCount,
            bau: bauCount,
            arl: arlCount,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching community counts:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
