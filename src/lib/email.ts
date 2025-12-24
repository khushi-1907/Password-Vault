import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send password reset email to user
 * @param email - User's email address
 * @param resetToken - Password reset token
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"VaultApp Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - VaultApp',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        color: #ffffff;
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .content h2 {
                        color: #1a1a1a;
                        font-size: 22px;
                        margin-top: 0;
                        margin-bottom: 20px;
                    }
                    .content p {
                        color: #555;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    .button {
                        display: inline-block;
                        padding: 14px 32px;
                        background: #2563eb;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: background 0.3s ease;
                    }
                    .button:hover {
                        background: #1d4ed8;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .warning p {
                        margin: 0;
                        color: #856404;
                        font-size: 14px;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .footer p {
                        color: #6c757d;
                        font-size: 14px;
                        margin: 5px 0;
                    }
                    .link {
                        color: #2563eb;
                        word-break: break-all;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 VaultApp</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your VaultApp master password. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p class="link">${resetUrl}</p>
                        
                        <div class="warning">
                            <p><strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. Resetting your password will clear all vault data due to client-side encryption.</p>
                        </div>
                        
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from VaultApp Security.</p>
                        <p>Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Password Reset Request - VaultApp

Hello,

We received a request to reset your VaultApp master password. 

Click the link below to create a new password:
${resetUrl}

⚠️ Important: This link will expire in 1 hour for security reasons. Resetting your password will clear all vault data due to client-side encryption.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated message from VaultApp Security.
Please do not reply to this email.
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
}
