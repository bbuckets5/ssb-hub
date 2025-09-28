// app/api/posts/[postId]/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const { postId } = params;

        // 1. Authenticate the user
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token required.' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 2. Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
        }

        // 3. Authorize the user (check if they own the post)
        if (post.author.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden: You can only delete your own posts.' }, { status: 403 });
        }

        // 4. Delete the post
        await Post.findByIdAndDelete(postId);

        return NextResponse.json({ message: 'Post deleted successfully.' }, { status: 200 });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }
        console.error("Failed to delete post:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
