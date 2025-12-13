"use strict";
import { transporter } from "../utils/email.js";

export async function sendMail({ to, subject, text, html }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not set in environment variables");
    }

    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text?.replace(/\n/g, "<br>") || "",
    };

    console.log(`📧 From: ${mailOptions.from}`);
    console.log(`📧 To: ${mailOptions.to}`);

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📧 Response:", info.response);
    
    return info;
  } catch (error) {
    console.error("❌ OTP email error:", error);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Error command:", error.command);
    if (error.response) {
      console.error("   SMTP Response:", error.response);
    }
    throw error;
  }
}

