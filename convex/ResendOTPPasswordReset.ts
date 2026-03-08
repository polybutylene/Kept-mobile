import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp-password-reset",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
    return generateRandomString(random, "0123456789", 8);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Kept <noreply@kept.systems>",
      to: [email],
      subject: "Reset your Kept password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background-color: #0D9488; border-radius: 50%; line-height: 48px; text-align: center;">
              <span style="color: white; font-size: 24px;">🏠</span>
            </div>
            <h1 style="color: #0D9488; font-size: 24px; margin: 12px 0 0;">Kept.</h1>
          </div>
          <h2 style="color: #111827; font-size: 20px; text-align: center; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #6B7280; text-align: center; margin-bottom: 24px;">
            Enter the code below to reset your password. This code expires in 15 minutes.
          </p>
          <div style="background-color: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${token}</span>
          </div>
          <p style="color: #9CA3AF; font-size: 13px; text-align: center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new Error("Could not send password reset email");
    }
  },
});
