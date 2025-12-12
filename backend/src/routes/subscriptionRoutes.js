"use strict";
import express from "express";
import { getPlans, createPlan, updatePlan, deletePlan, purchasePlan } from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";

const router = express.Router();

// public (members)
router.get("/plans", getPlans);

// purchase (member)
router.post("/purchase", authMiddleware, purchasePlan);

// Admin CRUD
router.post("/admin/create", authMiddleware, requireRole(["admin"]), createPlan);
router.put("/admin/:id", authMiddleware, requireRole(["admin"]), updatePlan);
router.delete("/admin/:id", authMiddleware, requireRole(["admin"]), deletePlan);
router.get("/admin/all", authMiddleware, requireRole(["admin"]), async (_req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    return res.json({ success: true, plans });
  } catch (err) {
    console.error("admin get plans error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch plans" });
  }
});

export default router;

