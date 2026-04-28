import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  await transport.sendMail({
    from: `"ZeroDayCTF" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your ZeroDayCTF account",
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #0f0f0f; color: #fff;">
        <h2 style="color: #09CC26;">Welcome to ZeroDayCTF!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #09CC26; color: #000; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 10px;">Verify Email</a>
        <p style="margin-top: 20px; color: #888;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  await transport.sendMail({
    from: `"ZeroDayCTF" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your ZeroDayCTF password",
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #0f0f0f; color: #fff;">
        <h2 style="color: #09CC26;">Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #09CC26; color: #000; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; color: #888;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}
