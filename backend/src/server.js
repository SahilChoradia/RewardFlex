"use strict";
// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import aiDietRoutes from "./routes/aiDietRoutes.js";
import { authMiddleware } from "./middleware/auth.js";
import { requireRole } from "./middleware/role.js";
import { adminAuth } from "./middleware/adminAuth.js";
import { seedSubscriptionPlans } from "./utils/seedSubscriptionPlans.js";
import { seedOffers } from "./utils/seedOffers.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS must be before routes
const allowedOrigins = [
  "http://localhost:3000",
  "https://streakfitx.vercel.app",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Body parsing must be before routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// routes
app.use("/auth", authRoutes);
app.use("/tasks", authMiddleware, requireRole(["member", "admin"]), taskRoutes);
app.use("/diet", authMiddleware, requireRole(["member", "admin"]), dietRoutes);
app.use("/rewards", authMiddleware, requireRole(["member", "admin"]), rewardRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/events", eventRoutes);
app.use("/leaderboard", authMiddleware, requireRole(["member", "admin"]), leaderboardRoutes);
app.use("/admin", adminAuth, adminRoutes);
app.use("/offers", offerRoutes);
app.use("/contact", contactRoutes);
app.use("/ai", aiDietRoutes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Seed default admin user if not present
async function createAdmin() {
  try {
    const adminEmail = "admin@streakfitx.com";
    const existing = await User.findOne({ email: adminEmail });
    if (existing) return;

    const hashed = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      verified: true,
    });
    console.log("🟢 Admin account created");
  } catch (err) {
    console.error("Failed to create admin account:", err);
  }
}

// 404 handler - must be after all routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler - must be last
app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to MongoDB before starting server
connectDB(process.env.MONGO_URI)
  .then(() => {
    // Ensure admin exists
    createAdmin();
    // Seed subscription plans if empty
    seedSubscriptionPlans();
    // Seed offers if empty
    seedOffers();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ MongoDB connected`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });

