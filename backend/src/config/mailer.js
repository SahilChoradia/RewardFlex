"use strict";
import nodemailer from "nodemailer";

// Using provided credentials directly as requested
const EMAIL_USER = "ninjagaming1607@gmail.com";
const EMAIL_PASS = "hyyp kdye oyli kbuv";

export function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"StreakFitX Support" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

