// app/api/users/register/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    await dbConnect();

    try {
        // 1. Receive the new 'community' field from the form
        const { username, email, password, community } = await request.json();

        // Check if user with that email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
            }
            if (existingUser.username === username) {
                return NextResponse.json({ message: 'This username is already taken.' }, { status: 409 });
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Create the new user with their chosen community
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            community: community, // Save the community
            allegianceChangesLeft: 2, // They've used one of their three chances
        });

        await newUser.save();

        return NextResponse.json({ message: 'User registered successfully!' }, { status: 201 });

    } catch (error) {
        console.error("Registration failed:", error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Server error during registration.' }, { status: 500 });
    }
}
