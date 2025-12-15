import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to, otp) {
  try {
    const { data, error } = await resend.emails.send({
      from: "StreakFitX <onboarding@resend.dev>",
      to: [to],
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Your OTP Code</h2>
          <p>Please verify your account using the OTP below:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend OTP email error:", error);
      return { success: false, error };
    }

    console.log("✅ OTP email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Resend OTP email exception:", error);
    return { success: false, error };
  }
}

export async function sendEmail(to, subject, text, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: "StreakFitX <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      text: text,
      html: html || text,
    });

    if (error) {
      console.error("❌ Resend email error:", error);
      return { success: false, error };
    }

    console.log("✅ Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Resend email exception:", error);
    return { success: false, error };
  }
}
