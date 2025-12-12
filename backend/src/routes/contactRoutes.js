"use strict";
import express from "express";
import { submitContactForm } from "../controllers/contactController.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// public
router.post("/submit", submitContactForm);

// admin-only view of all contact messages
router.get("/admin/all", authMiddleware, requireRole(["admin"]), async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  return res.json({ success: true, messages });
});

export default router;

