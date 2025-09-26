// app/api/trivia/admin-questions/[questionId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
    await dbConnect();
    try {
        await requireAdmin(); // Secure the route
        const { questionId } = params;
        const { questionText, options, correctAnswer } = await request.json();

        // --- Server-side validation ---
        if (!questionText || !options || !correctAnswer) {
            return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }
        if (options.length !== 4 || options.some(opt => !opt.trim())) {
            return NextResponse.json({ message: 'You must provide exactly 4 non-empty answer options.' }, { status: 400 });
        }
        if (!options.includes(correctAnswer)) {
            return NextResponse.json({ message: 'The correct answer must be one of the four options.' }, { status: 400 });
        }
        // --------------------------------

        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                questionText,
                options,
                correctAnswer
            },
            { new: true, runValidators: true } // Return the updated doc and run schema validation
        );

        if (!updatedQuestion) {
            return NextResponse.json({ message: 'Question not found.' }, { status: 404 });
        }
        
        // Repopulate the submittedBy field for the frontend
        await updatedQuestion.populate('submittedBy', 'username');

        return NextResponse.json(updatedQuestion, { status: 200 });

    } catch (error) {
        console.error("Failed to update question:", error);
        if (error.message.includes('Forbidden') || error.message.includes('Authentication')) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
