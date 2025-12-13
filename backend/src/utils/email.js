"use strict";
import nodemailer from "nodemailer";

// Ensure environment variables are loaded
// This file should be imported AFTER dotenv.config() is called in server.js

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set in environment variables.");
  console.warn("   Email sending will fail. Please set these in .env or Render environment variables.");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection on initialization
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("   Make sure EMAIL_USER and EMAIL_PASS are set correctly in environment variables.");
  } else {
    console.log("✅ Email transporter is ready to send messages");
    console.log(`   Using email: ${process.env.EMAIL_USER || "NOT SET"}`);
  }
});

