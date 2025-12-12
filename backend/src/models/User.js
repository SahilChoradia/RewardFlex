"use strict";
import mongoose from "mongoose";

const DietHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    planHash: { type: String, required: true },
    plan: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const RewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unlockedOn: { type: Date, required: true },
    claimed: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    verified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    streak: { type: Number, default: 0 },
    rank: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    subscription: {
      plan: { type: String, default: null },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    dietHistory: [DietHistorySchema],
    rewards: [RewardSchema],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

