// app/api/posts/[postId]/like/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';

const DAILY_LIKE_RAX_CAP = 10;

export async function POST(request, { params }) {
    await dbConnect();
    
    try {
        const { postId } = params;

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const [post, liker] = await Promise.all([
            Post.findById(postId),
            User.findById(userId)
        ]);

        if (!post) return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
        if (!liker) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

        // --- NEW FIX: This handles old posts where 'likes' might not be an array ---
        if (!Array.isArray(post.likes)) {
            post.likes = []; // If 'likes' is a number or missing, reset it to an empty array
        }
        // ----------------------------------------------------------------------

        if (post.likes.includes(userId)) {
            return NextResponse.json({ message: 'You have already liked this post.' }, { status: 409 });
        }

        post.likes.push(userId);
        
        const isSelfLike = post.author.toString() === userId;
        let raxAwardedToLiker = 0;
        
        if (!isSelfLike) {
            const today = new Date();
            const lastLikeDate = liker.lastLikeDate ? new Date(liker.lastLikeDate) : null;

            if (!lastLikeDate || lastLikeDate.toDateString() !== today.toDateString()) {
                liker.dailyLikesCount = 0;
            }

            if (liker.dailyLikesCount < DAILY_LIKE_RAX_CAP) {
                raxAwardedToLiker = 1;
                liker.rax += raxAwardedToLiker;
                liker.dailyLikesCount += 1;
            }
            
            liker.lastLikeDate = new Date();
            await User.findByIdAndUpdate(post.author, { $inc: { rax: 2 } });
        }
        
        await Promise.all([post.save(), liker.save()]);

        return NextResponse.json({ 
            message: 'Post liked successfully!',
            likes: post.likes.length,
            raxAwarded: raxAwardedToLiker
        }, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to like post:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
