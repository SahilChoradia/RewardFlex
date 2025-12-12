"use strict";
import nodemailer from "nodemailer";

// Using provided credentials directly as requested
const EMAIL_USER = "ninjagaming1607@gmail.com";
const EMAIL_PASS = "hyyp kdye oyli kbuv";

let mailer = null;

if (EMAIL_USER && EMAIL_PASS) {
  mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
} else {
  console.warn(
    "[mailService] EMAIL_USER or EMAIL_PASS not set. Email sending is disabled."
  );
}

export async function sendEmail(to, subject, text) {
  if (!mailer) {
    throw new Error("Email credentials not configured.");
  }
  return mailer.sendMail({
    from: `"StreakFitX Support" <${EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

