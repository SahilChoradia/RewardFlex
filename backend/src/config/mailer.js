"use strict";
import nodemailer from "nodemailer";

// Using provided credentials directly as requested
const EMAIL_USER = "ninjagaming1607@gmail.com";
const EMAIL_PASS = "hyyp kdye oyli kbuv";

let transporter = null;

export function createTransporter() {
  if (transporter) {
    return transporter;
  }
  
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Verify transporter connection
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email transporter verification failed:", error);
    } else {
      console.log("✅ Email transporter is ready to send messages");
    }
  });

  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"StreakFitX Support" <${EMAIL_USER}>`,
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
    console.error("❌ Email sending error:");
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Error command:", error.command);
    console.error("   Full error:", error);
    throw error;
  }
}

