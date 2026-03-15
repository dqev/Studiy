/**
 * Email Verification Templates for Firebase Authentication
 * Contains HTML templates for email verification emails
 */

export const emailVerificationTemplate = {
    // HTML Email Template for Verification
    getVerificationEmailHTML: (userName: string, verificationLink: string, appName: string = 'Studiy') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
        }
        .email-wrapper {
            background-color: #f5f7fa;
            padding: 40px 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #1a202c;
        }
        .greeting strong {
            color: #667eea;
        }
        .message {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .verification-section {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .verification-section p {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #4a5568;
        }
        .verification-section p:last-child {
            margin-bottom: 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .link-section {
            background-color: #f7fafc;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .link-section p {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #718096;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .link-section a {
            display: inline-block;
            word-break: break-all;
            color: #667eea;
            text-decoration: none;
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #718096;
        }
        .footer p {
            margin: 8px 0;
        }
        .security-info {
            background-color: #fef5e7;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 12px;
            color: #7d6608;
        }
        .security-info strong {
            color: #b8860b;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 30px 0;
        }
        .logo-section {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
        }
        @media (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
            .cta-button {
                width: 100%;
                text-align: center;
                box-sizing: border-box;
            }
            .header {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1>📧 Email Verification</h1>
                <p>Welcome to ${appName}</p>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="greeting">
                    Hello <strong>${userName}</strong>,
                </div>

                <div class="message">
                    <p>Thank you for signing up with ${appName}! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
                </div>

                <!-- CTA Button -->
                <center>
                    <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
                </center>

                <!-- Verification Section -->
                <div class="verification-section">
                    <p><strong>Why verify your email?</strong></p>
                    <p>✓ Secure your account with verified contact information</p>
                    <p>✓ Receive important updates and notifications</p>
                    <p>✓ Unlock full access to ${appName} features</p>
                    <p>✓ Enable password recovery options</p>
                </div>

                <!-- Link Section -->
                <div class="link-section">
                    <p>Can't click the button?</p>
                    <p>Copy and paste this link in your browser:</p>
                    <a href="${verificationLink}">${verificationLink}</a>
                </div>

                <!-- Security Info -->
                <div class="security-info">
                    <strong>🔒 Security Note:</strong> This link will expire in 24 hours. If you didn't sign up for this account, please ignore this email.
                </div>

                <!-- Support -->
                <p style="font-size: 14px; color: #4a5568; margin-top: 30px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@studiy.app" style="color: #667eea; text-decoration: none;">support@studiy.app</a>
                </p>

                <div class="divider"></div>

                <!-- Footer -->
                <div class="footer">
                    <p><strong>© 2026 ${appName}. All rights reserved.</strong></p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `,

    // Plain Text Email Template
    getVerificationEmailText: (userName: string, verificationLink: string, appName: string = 'Studiy') => `
Welcome to ${appName}!

Hello ${userName},

Thank you for signing up with ${appName}! To verify your email address and complete your registration, please click the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create this account, you can safely ignore this email.

---

Why verify your email?
✓ Secure your account with verified contact information
✓ Receive important updates and notifications
✓ Unlock full access to ${appName} features
✓ Enable password recovery options

---

Need help? Contact us at support@studiy.app

© 2026 ${appName}. All rights reserved.
    `,

    // Dark Mode Template
    getVerificationEmailHTMLDark: (userName: string, verificationLink: string, appName: string = 'Studiy') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #e2e8f0;
            margin: 0;
            padding: 0;
            background-color: #1a202c;
        }
        .email-wrapper {
            background-color: #1a202c;
            padding: 40px 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #2d3748;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            background-color: #2d3748;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #e2e8f0;
        }
        .greeting strong {
            color: #a0aec0;
        }
        .message {
            font-size: 14px;
            color: #cbd5e0;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .verification-section {
            background-color: #1a202c;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
            color: #cbd5e0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
        }
        .link-section {
            background-color: #1a202c;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
            border: 1px solid #4a5568;
        }
        .link-section a {
            color: #667eea;
        }
        .footer {
            background-color: #1a202c;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #4a5568;
            font-size: 12px;
            color: #a0aec0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <h1>📧 Email Verification</h1>
                <p>Welcome to ${appName}</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Hello <strong>${userName}</strong>,
                </div>

                <div class="message">
                    <p>Thank you for signing up with ${appName}! Please verify your email address:</p>
                </div>

                <center>
                    <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
                </center>

                <div class="verification-section">
                    <p><strong>Why verify your email?</strong></p>
                    <p>✓ Secure your account</p>
                    <p>✓ Receive updates</p>
                    <p>✓ Unlock full features</p>
                </div>

                <div class="link-section">
                    <p>Link: <a href="${verificationLink}">${verificationLink}</a></p>
                </div>
            </div>

            <div class="footer">
                <p>© 2026 ${appName}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `,

    // Minimal/Simple Template
    getVerificationEmailHTMLSimple: (userName: string, verificationLink: string, appName: string = 'Studiy') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; border: 1px solid #ddd; margin-top: 20px; border-radius: 5px; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Email Verification - ${appName}</h2>
        </div>

        <div class="content">
            <p>Hi ${userName},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email</a>
            <p>If the button doesn't work, copy this link:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>This link expires in 24 hours.</p>
        </div>

        <div class="footer">
            <p>© 2026 ${appName}</p>
        </div>
    </div>
</body>
</html>
    `,
};

// Export function to use templates
export const getEmailTemplate = (
    templateType: 'html' | 'text' | 'dark' | 'simple' = 'html',
    userName: string,
    verificationLink: string,
    appName: string = 'Studiy'
): string => {
    switch (templateType) {
        case 'text':
            return emailVerificationTemplate.getVerificationEmailText(userName, verificationLink, appName);
        case 'dark':
            return emailVerificationTemplate.getVerificationEmailHTMLDark(userName, verificationLink, appName);
        case 'simple':
            return emailVerificationTemplate.getVerificationEmailHTMLSimple(userName, verificationLink, appName);
        case 'html':
        default:
            return emailVerificationTemplate.getVerificationEmailHTML(userName, verificationLink, appName);
    }
};

// Email configuration object
export const emailConfig = {
    sender: {
        name: 'Studiy',
        email: 'noreply@studiy.app',
    },
    subject: 'Verify your email address - Studiy',
    replyTo: 'support@studiy.app',
    appName: 'Studiy',
    linkExpiryHours: 24,
};

// Helper function to generate verification email config
export const generateEmailVerificationConfig = (userName: string, verificationLink: string) => {
    return {
        to: '',  // Will be set dynamically
        subject: emailConfig.subject,
        from: `${emailConfig.sender.name} <${emailConfig.sender.email}>`,
        replyTo: emailConfig.replyTo,
        html: emailVerificationTemplate.getVerificationEmailHTML(userName, verificationLink, emailConfig.appName),
        text: emailVerificationTemplate.getVerificationEmailText(userName, verificationLink, emailConfig.appName),
    };
};
