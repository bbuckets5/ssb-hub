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

        // 2. Compare the submitted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
        }

        // --- NEW: Daily Login Bonus Logic ---
        const today = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        let dailyRaxAwarded = 0;

        // Check if last login was before the start of today
        if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
            dailyRaxAwarded = 10; // Award 10 Rax
            user.rax += dailyRaxAwarded;
            user.lastLogin = new Date(); // Update the last login time
            await user.save();
        }
        // ------------------------------------

        // 3. Create a secure token (JWT)
        const payload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Send the token and a dynamic message back to the user
        let message = 'Login successful!';
        if (dailyRaxAwarded > 0) {
            message = `Login successful! You earned +${dailyRaxAwarded} Rax for your daily login!`;
        }

        return NextResponse.json({ message: message, token }, { status: 200 });

    } catch (error) {
        console.error("Login failed:", error);
        return NextResponse.json({ message: 'Server error during login.' }, { status: 500 });
    }
}
