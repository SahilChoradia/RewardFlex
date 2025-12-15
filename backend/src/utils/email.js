"use strict";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Ensure environment variables are loaded
// This file should be imported AFTER dotenv.config() is called in server.js

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
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
    } else {
      console.log("✅ Email transporter is ready to send messages");
    }
  });
} else {
  console.warn("⚠️ Email disabled: EMAIL_USER or EMAIL_PASS not set.");
}

export { transporter };

