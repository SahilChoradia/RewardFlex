"use strict";
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, plan: 1, startDate: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

