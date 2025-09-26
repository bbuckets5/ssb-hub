// lib/auth.js

import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export const requireAdmin = async () => {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authentication token is required.');
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).lean();

    if (!user || user.role !== 'admin') {
        throw new Error('Forbidden: Admin access required.');
    }

    return user; // Return the admin user if successful
};
