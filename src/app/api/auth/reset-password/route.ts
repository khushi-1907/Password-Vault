import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // Validate password strength
        const isStrongPassword = validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });

        if (!isStrongPassword) {
            return NextResponse.json({
                error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            }, { status: 400 });
        }

        await dbConnect();

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
        });

        if (!user) {
            return NextResponse.json({
                error: 'Invalid or expired reset token. Please request a new password reset.'
            }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log(`Password reset successful for user: ${user.email}`);

        return NextResponse.json({
            message: 'Password reset successful. You can now login with your new password.'
        }, { status: 200 });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
