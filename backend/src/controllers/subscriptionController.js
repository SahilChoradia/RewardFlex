"use strict";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";
import { User } from "../models/User.js";

export async function getPlans(_req, res) {
  try {
    const plans = await SubscriptionPlan.find({ active: true }).sort({ price: 1 });
    return res.status(200).json({ success: true, plans });
  } catch (err) {
    console.error("getPlans error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch plans" });
  }
}

// Admin create
export async function createPlan(req, res) {
  try {
    const { name, slug, price, durationDays, features = [], discountLabel = null } = req.body;
    if (!name || !slug || !price || !durationDays) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const exists = await SubscriptionPlan.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, error: "Slug already exists" });

    const plan = await SubscriptionPlan.create({
      name,
      slug,
      price,
      durationDays,
      features,
      discountLabel,
    });
    return res.status(201).json({ success: true, plan });
  } catch (err) {
    console.error("createPlan error:", err);
    return res.status(500).json({ success: false, error: "Failed to create plan" });
  }
}

// Admin update
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true });
    if (!plan) return res.status(404).json({ success: false, error: "Plan not found" });
    return res.status(200).json({ success: true, plan });
  } catch (err) {
    console.error("updatePlan error:", err);
    return res.status(500).json({ success: false, error: "Failed to update plan" });
  }
}

// Admin delete (soft-delete)
export async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!plan) return res.status(404).json({ success: false, error: "Plan not found" });
    return res.status(200).json({ success: true, plan });
  } catch (err) {
    console.error("deletePlan error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete plan" });
  }
}

// Purchase route (member)
export async function purchasePlan(req, res) {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ success: false, error: "planId required" });

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.active) return res.status(400).json({ success: false, error: "Invalid plan" });

    // Mock purchase: attach to user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    user.subscription = {
      plan: plan._id,
      planName: plan.name,
      startDate,
      endDate,
    };
    await user.save();

    return res.status(200).json({ success: true, subscription: user.subscription });
  } catch (err) {
    console.error("purchasePlan error:", err);
    return res.status(500).json({ success: false, error: "Failed to purchase plan" });
  }
}
