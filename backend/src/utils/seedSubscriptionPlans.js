"use strict";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";

export async function seedSubscriptionPlans() {
  try {
    const count = await SubscriptionPlan.countDocuments();
    if (count === 0) {
      await SubscriptionPlan.create([
        {
          name: "Monthly Plan",
          slug: "monthly",
          price: 599,
          currency: "INR",
          durationDays: 30,
          features: ["Full gym access", "Streak tracking & rewards", "AI diet planner", "Event participation"],
          discountLabel: null,
        },
        {
          name: "Annual Plan",
          slug: "annual",
          price: 4999,
          currency: "INR",
          durationDays: 365,
          features: [
            "Full gym access",
            "Streak tracking & rewards",
            "AI diet planner",
            "Event participation",
            "Priority support",
            "2 free personal training sessions",
          ],
          discountLabel: "15% OFF",
        },
      ]);
      console.log("✅ Default subscription plans seeded");
    } else {
      console.log("Subscription plans already exist - skipping seed");
    }
  } catch (err) {
    console.error("seedSubscriptionPlans error:", err);
  }
}

