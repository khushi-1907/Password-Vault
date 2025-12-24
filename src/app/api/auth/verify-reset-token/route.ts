import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({
                valid: false,
                error: 'Token is required'
            }, { status: 400 });
        }

        await dbConnect();

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid or expired token'
            }, { status: 200 });
        }

        return NextResponse.json({
            valid: true,
            message: 'Token is valid'
        }, { status: 200 });
    } catch (error: any) {
        console.error('Verify token error:', error);
        return NextResponse.json({
            valid: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
