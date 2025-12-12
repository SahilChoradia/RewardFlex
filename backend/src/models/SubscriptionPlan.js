"use strict";
import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Monthly"
    slug: { type: String, required: true, unique: true }, // e.g. "monthly"
    price: { type: Number, required: true }, // integer in INR (e.g. 599)
    currency: { type: String, default: "INR" },
    durationDays: { type: Number, required: true }, // e.g. 30 or 365
    features: { type: [String], default: [] }, // list of bullet points
    discountLabel: { type: String, default: null }, // "15% OFF" optional
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
