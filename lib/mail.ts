// lib/mail.ts
import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
    // Determine base URL (in dev it might differ, but assuming localhost or env var)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;

    if (!process.env.SMTP_HOST) {
        console.log("------------------------------------------");
        console.log("⚠️ SMTP CONFIG MISSING. PRINTING TOKEN FOR DEV:");
        console.log(`To: ${email}`);
        console.log(`Link: ${confirmLink}`);
        console.log("------------------------------------------");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"TechMC Glossary" <onboarding@resend.dev>',
            to: email,
            subject: "Confirm your email",
            html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Failed to send verification email:", error);
        // Fallback logging for user content if email fails
        console.log(`Link: ${confirmLink}`);
    }
};
