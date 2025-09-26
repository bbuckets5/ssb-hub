// app/api/trivia/submissions/[questionId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

const RAX_FOR_APPROVED_QUESTION = 150;

export async function PATCH(request, { params }) {
    await dbConnect();
    try {
        await requireAdmin(); // Ensures only an admin can perform this action
        const { questionId } = params;
        const { status } = await request.json();

        if (!['approved', 'denied'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { status: status },
            { new: true }
        );

        if (!updatedQuestion) {
            return NextResponse.json({ message: 'Question not found.' }, { status: 404 });
        }

        // If the question was approved, award Rax to the submitter
        if (status === 'approved') {
            await User.findByIdAndUpdate(
                updatedQuestion.submittedBy,
                { $inc: { rax: RAX_FOR_APPROVED_QUESTION } }
            );
        }

        return NextResponse.json({ 
            message: `Question successfully marked as ${status}.` 
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to update submission status:", error);
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
