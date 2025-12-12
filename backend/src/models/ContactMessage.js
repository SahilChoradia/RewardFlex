"use strict";
import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  aiResponse: String,
  createdAt: { type: Date, default: Date.now },
});

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

