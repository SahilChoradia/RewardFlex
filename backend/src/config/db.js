"use strict";
import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    if (!uri) {
      throw new Error("MONGO_URI is not set in .env file");
    }

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(uri, options);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message || err);
    
    // Provide helpful error messages for common issues
    if (err.message && err.message.includes("IP")) {
      console.error("\n🔧 SOLUTION: IP Whitelist Issue");
      console.error("Your IP address is not whitelisted in MongoDB Atlas.");
      console.error("To fix this:");
      console.error("1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/");
      console.error("2. Navigate to: Network Access → Add IP Address");
      console.error("3. Click 'Add Current IP Address' or add: 0.0.0.0/0 (for development only)");
      console.error("4. Wait 1-2 minutes for changes to propagate");
      console.error("\n⚠️  Note: 0.0.0.0/0 allows all IPs (use only for development)");
    } else if (err.message && err.message.includes("authentication")) {
      console.error("\n🔧 SOLUTION: Authentication Issue");
      console.error("Check your MONGO_URI in .env file.");
      console.error("Make sure the username and password are correct.");
    } else if (err.message && err.message.includes("ENOTFOUND") || err.message.includes("DNS")) {
      console.error("\n🔧 SOLUTION: DNS/Network Issue");
      console.error("Check your internet connection and MongoDB Atlas cluster status.");
    }
    
    throw err; // Re-throw to let server.js handle it
  }
}

