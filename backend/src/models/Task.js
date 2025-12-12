"use strict";
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Daily task grouping
    date: { type: Date, required: true },
    wakeupCompleted: { type: Boolean, default: false },
    exerciseLink: { type: String, default: null },
    exerciseCompleted: { type: Boolean, default: false },
    dietCompleted: { type: Boolean, default: false },
    completedCount: { type: Number, default: 0 },

    // Water verification fields
    drinkWaterPhotoUrl: { type: String, default: null }, // e.g., Cloud/URL
    drinkWaterPhotoBase64: { type: String, default: null }, // inline storage fallback
    drinkWaterVerified: { type: Boolean, default: false },

    // Generic task record for admin flows
    type: {
      type: String,
      enum: ["water", "exercise", "diet", "wakeup"],
      default: "water",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    imageUrl: { type: String, default: null },
    imageBase64: { type: String, default: null },
    videoLink: { type: String, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, date: 1 }, { unique: true, sparse: true });

export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

