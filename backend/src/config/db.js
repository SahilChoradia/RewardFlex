"use strict";
import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    if (!uri) {
      throw new Error("MONGO_URI is not set in .env file");
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message || err);
    throw err; // Re-throw to let server.js handle it
  }
}

