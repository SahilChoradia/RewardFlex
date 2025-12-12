"use strict";
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    discountPercent: { type: Number, default: 0 },
    validFrom: { type: Date, required: false },
    validUntil: { type: Date, required: false },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const Offer = mongoose.model("Offer", offerSchema);
