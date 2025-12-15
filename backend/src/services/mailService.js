"use strict";
import { transporter } from "../utils/email.js";

export async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email disabled: EMAIL_USER or EMAIL_PASS not set.");
      return; // Don't throw, just return
    }

    if (!transporter) {
      console.warn("⚠️ Email disabled: Transporter not initialized.");
      return { success: false, error: "Email service disabled" };
    }

    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("❌ Contact email error:", error);
    // Don't rethrow to avoid crashing the request handler
    return { success: false, error: error.message };
  }
}

