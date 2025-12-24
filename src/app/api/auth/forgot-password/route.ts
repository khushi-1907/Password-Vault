import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success message (security best practice - don't reveal if email exists)
        const successMessage = 'If an account with that email exists, a password reset link has been sent.';

        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json({ message: successMessage }, { status: 200 });
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before storing in database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration (1 hour from now)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await user.save();

        // Send email with unhashed token
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            // Clear the token if email fails
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return NextResponse.json({ error: 'Failed to send reset email. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ message: successMessage }, { status: 200 });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
