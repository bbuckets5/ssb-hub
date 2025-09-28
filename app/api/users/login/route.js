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

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
        }

        // --- MODIFIED: Daily Login Bonus Logic ---
        const today = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        let dailyRaxAwarded = 0;

        if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
            dailyRaxAwarded = 10;
            // Use a single, efficient command to update rax, raxEarned, and lastLogin
            await User.findByIdAndUpdate(user._id, {
                $inc: { rax: dailyRaxAwarded, raxEarned: dailyRaxAwarded },
                $set: { lastLogin: new Date() }
            });
        }
        // ------------------------------------

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
