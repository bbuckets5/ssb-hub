// app/api/community/pledge/route.js

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// --- SECRET INVITE CODES ---
// You can change these to whatever you want
const inviteCodes = {
  ytg: "YTG2TILIDIE",
  bau: "BAUFOREVER",
  arl: "ARLARMY",
  ktf: "KTFWORLD",
  shniggers: "SHNIGGERSUNITE"
};
// -------------------------

export async function POST(request) {
  await dbConnect();

  try {
    // 1. Get the user's token from the request headers
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify the token to get the user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { communityName, inviteCode } = await request.json();

    // 3. Check if the submitted invite code is correct for the community
    if (inviteCodes[communityName] !== inviteCode) {
      return NextResponse.json({ message: 'Invalid invite code.' }, { status: 400 });
    }

    // 4. Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    
    // 5. Check if the user is trying to join the same community
    if (user.community === communityName) {
      return NextResponse.json({ message: `You are already a member of ${communityName.toUpperCase()}.` }, { status: 400 });
    }

    // 6. Check if the user has any allegiance changes left
    if (user.allegianceChangesLeft <= 0) {
      return NextResponse.json({ message: 'You have no allegiance changes left.' }, { status: 403 });
    }

    // 7. Update the user's profile
    user.community = communityName;
    user.allegianceChangesLeft -= 1;
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
