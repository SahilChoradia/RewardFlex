"use strict";
import { User } from "../models/User.js";

const rewardsConfig = [
  { name: "5% Subscription Discount", requiredStreak: 7 },
  { name: "Gift Hamper", requiredStreak: 30 },
  { name: "1 Week Personal Trainer", requiredStreak: 60 },
  { name: "1 Month Free", requiredStreak: 120 },
];

export async function listRewards(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const rewards = rewardsConfig.map((r) => {
    const existing = user.rewards?.find((ur) => ur.name === r.name);
    const unlocked = (user.streak || 0) >= r.requiredStreak;
    return {
      name: r.name,
      requiredStreak: r.requiredStreak,
      unlocked,
      claimed: existing?.claimed || false,
    };
  });
  return res.json({ success: true, rewards });
}

export async function claimReward(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Reward name is required" });

  const config = rewardsConfig.find((r) => r.name === name);
  if (!config) return res.status(400).json({ error: "Invalid reward" });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if ((user.streak || 0) < config.requiredStreak) {
    return res.status(400).json({ error: "Reward not unlocked yet" });
  }

  const existing = user.rewards?.find((r) => r.name === name);
  if (existing) {
    existing.claimed = true;
  } else {
    user.rewards = user.rewards || [];
    user.rewards.push({ name, unlockedOn: new Date(), claimed: true });
  }
  await user.save();

  return res.json({ success: true, message: "Reward claimed" });
}

