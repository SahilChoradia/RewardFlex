"use strict";
import { transporter } from "../utils/email.js";

export async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not set in environment variables");
    }

    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("❌ Contact email error:", error);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    throw error;
  }
}

