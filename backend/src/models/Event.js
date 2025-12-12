"use strict";
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    fullDescription: { type: String },
    date: { type: Date, required: true },
    image: { type: String },
    discountPercent: { type: Number, default: 0 },
    createdBy: { type: String, default: "admin" }, // allow admin string fallback
    joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

