"use strict";
import mongoose from "mongoose";

const TaskTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["water", "exercise", "diet", "wakeup"],
      required: true,
    },
    points: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    requiresVerification: { type: Boolean, default: false },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export const TaskTemplate = mongoose.models.TaskTemplate || mongoose.model("TaskTemplate", TaskTemplateSchema);










