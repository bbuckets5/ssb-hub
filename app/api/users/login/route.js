// app/api/users/login/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    await dbConnect();

    try {
        const { email, password } = await request.json();

        // 1. Find the user by their email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
        }

        // 2. Compare the submitted password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
        }

        // 3. If passwords match, create a secure token (JWT)
        const payload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token will be valid for 1 day
        );

        // 4. Send the token back to the user
        return NextResponse.json({ message: 'Login successful!', token }, { status: 200 });

    } catch (error) {
        console.error("Login failed:", error);
        return NextResponse.json({ message: 'Server error during login.' }, { status: 500 });
    }
}
