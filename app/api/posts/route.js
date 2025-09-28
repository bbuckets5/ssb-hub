// app/api/posts/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary'; // Import our new helper

// GET function to fetch all posts (no changes)
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

// POST function is now completely rewritten to handle file uploads
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
        
        // 1. Parse the incoming data as FormData
        const formData = await request.formData();
        const content = formData.get('content');
        const imageFile = formData.get('image');
        
        let imageUrl = null;

        // 2. If an image file exists, upload it to Cloudinary
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'ssb-hub-posts' }, // Organize uploads in a folder
                    (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    }
                ).end(buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        if (!content && !imageUrl) {
             return NextResponse.json({ message: 'Post must have content or an image.' }, { status: 400 });
        }

        // 3. Create the new post with the content and optional image URL
        const newPost = new Post({
            author: userId,
            content: content || '',
            imageUrl: imageUrl,
            community: user.community,
        });
        await newPost.save();
        
        await User.findByIdAndUpdate(userId, { $inc: { rax: 5, raxEarned: 5 } });
        
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
