"use strict";
import { User } from "../models/User.js";

export async function getLeaderboard(_req, res) {
  const users = await User.find({ role: "member", verified: true })
    .select("name streak rank createdAt")
    .sort({ streak: -1, createdAt: 1 });
  res.json({ success: true, leaderboard: users });
}

