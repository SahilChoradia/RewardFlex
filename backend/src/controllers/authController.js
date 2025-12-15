"use strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendMail } from "../config/mailer.js";
import crypto from "crypto";

const OTP_EXP_MINUTES = 10;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    console.log("HIT /auth/signup", { name, email, password: "***" });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000);

    // Create user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: "member",
      verified: false,
      otp,
      otpExpiresAt,
    });

    console.log("✅ User created in MongoDB:", newUser._id);

    // Try to send email, but don't fail if email fails
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to StreakFitX!</h2>
        <p>Thank you for registering. Please verify your account using the OTP below:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This OTP will expire in ${OTP_EXP_MINUTES} minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="color: #9CA3AF; font-size: 12px;">© StreakFitX - Your Fitness Journey Companion</p>
      </div>
    `;

    sendMail({
      to: email,
      subject: "StreakFitX - Verify your account",
      text: `Your OTP is ${otp}. It expires in ${OTP_EXP_MINUTES} minutes.`,
      html: htmlContent,
    })
      .then(() => {
        console.log("✅ OTP email sent successfully to:", email);
        console.log("✅ OTP generated:", otp);
      })
      .catch((err) => {
        console.error("❌ OTP email error:", err);
        console.error("   Email sending failed (user still created)");
        console.error("   User can request OTP resend later");
        // Continue - user is created, they can request OTP resend later
      });

    // Always return success JSON response
    return res.status(200).json({
      success: true,
      message: "Registered successfully. Verify OTP to proceed to login.",
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    console.log("HIT /auth/verify-otp", { email, otp: "***" });

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (user.verified) {
      return res.status(200).json({ success: true, message: "Already verified" });
    }
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP not generated" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    console.log("✅ OTP verified for:", email);

    // Try to send welcome email, but don't fail if it fails
    try {
      await sendMail({
        to: email,
        subject: "Welcome to StreakFitX",
        text: "Your account is verified. You can now login.",
      });
    } catch (emailError) {
      console.error("⚠️ Welcome email failed (verification still successful):", emailError.message);
    }

    return res.status(200).json({ success: true, message: "Account verified. You can now login." });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    return res.status(500).json({ error: "Verification failed. Please try again." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    console.log("HIT /auth/login", { email, password: "***" });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Admin login: bypass OTP/verified requirement
    const isAdminLogin = email === "admin@streakfitx.com";

    if (!isAdminLogin && !user.verified) {
      return res.status(400).json({ error: "Account not verified. Please verify your email first." });
    }

    // Compare password hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Force admin role if admin email
    const role = isAdminLogin ? "admin" : user.role;

    // Generate JWT token (30 days expiration)
    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-site (if frontend/backend on diff domains), 'lax' for local
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    console.log("✅ Login successful for:", email);

    // Always return JSON response
    return res.status(200).json({
      success: true,
      role,
      token, // Keep returning token for now just in case, but frontend should ignore it
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        streak: user.streak || 0,
        rank: user.rank || "Bronze",
        subscription: user.subscription || null,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    console.log("HIT /auth/resend-otp", { email });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.verified) {
      return res.status(200).json({ success: true, message: "Account already verified" });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log("✅ New OTP generated for:", email);
    console.log("✅ OTP:", otp);

    // Send email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">StreakFitX - New OTP</h2>
        <p>You requested a new OTP. Please use the code below to verify your account:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This OTP will expire in ${OTP_EXP_MINUTES} minutes.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="color: #9CA3AF; font-size: 12px;">© StreakFitX - Your Fitness Journey Companion</p>
      </div>
    `;

    try {
      await sendMail({
        to: email,
        subject: "StreakFitX - New Verification OTP",
        text: `Your new OTP is ${otp}. It expires in ${OTP_EXP_MINUTES} minutes.`,
        html: htmlContent,
      });
      console.log("✅ Resend OTP email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ OTP email error:", emailError);
      throw emailError; // Re-throw to be caught by outer try-catch
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent to your email. Please check your inbox."
    });
  } catch (err) {
    console.error("❌ Resend OTP error:", err);
    return res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiresAt");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure admin role is preserved if admin email
    const role = user.email === "admin@streakfitx.com" ? "admin" : user.role;

    return res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        streak: user.streak || 0,
        rank: user.rank || "Bronze",
        subscription: user.subscription || null,
      },
    });
  } catch (err) {
    console.error("❌ /auth/me error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
}

