// app/api/posts/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';

// GET function to fetch all posts
export async function GET() {
    await dbConnect();
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 }) 
            .populate('author', 'username community');

        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}

// POST function to create a new post
export async function POST(request) {
    await dbConnect();
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        const { content } = await request.json();
        if (!content || content.trim().length === 0) {
            return NextResponse.json({ message: 'Post content cannot be empty.' }, { status: 400 });
        }

        const newPost = new Post({
            author: userId,
            content: content.trim(),
            community: user.community,
        });
        await newPost.save();
        
        // --- NEW: Award Rax for posting ---
        await User.findByIdAndUpdate(userId, { $inc: { rax: 5 } });
        // ---------------------------------
        
        const postToSend = await Post.findById(newPost._id).populate('author', 'username community');

        return NextResponse.json(postToSend, { status: 201 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to create post:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
