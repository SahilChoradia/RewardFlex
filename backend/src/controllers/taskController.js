"use strict";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { getRankFromStreak } from "../utils/rank.js";
import multer from "multer";

// Multer config for water photos (memory storage, 5MB limit)
const storage = multer.memoryStorage();
export const waterUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getOrCreateTodayTask(userId) {
  const today = startOfToday();
  let task = await Task.findOne({ userId, date: today });
  if (!task) {
    task = await Task.create({ userId, date: today });
  }
  return task;
}

function recalcCompleted(task) {
  let count = 0;
  if (task.wakeupCompleted) count++;
  if (task.exerciseCompleted) count++;
  if (task.dietCompleted) count++;
  // water counts only when verified
  if (task.drinkWaterVerified) count++;
  task.completedCount = count;
}

async function maybeUpdateStreak(task, userId) {
  if (task.completedCount === 4) {
    const user = await User.findById(userId);
    if (!user) return;
    user.streak = (user.streak || 0) + 1;
    user.rank = getRankFromStreak(user.streak);
    await user.save();
  }
}

export async function wakeup(req, res) {
  const now = new Date();
  if (now.getHours() > 8) {
    return res.status(400).json({ error: "Wake up task can only be completed before 8:00 AM." });
  }
  const task = await getOrCreateTodayTask(req.user.id);
  task.wakeupCompleted = true;
  recalcCompleted(task);
  await task.save();
  await maybeUpdateStreak(task, req.user.id);
  return res.json({ success: true, task });
}

export async function drinkWater(req, res) {
  const imageBase64 = req.body.imageBase64;

  if (!req.file && !imageBase64) {
    return res.status(400).json({ error: "Photo is required" });
  }

  const task = await getOrCreateTodayTask(req.user.id);
  task.type = "water";
  task.status = "pending";

  if (req.file) {
    const base64 = req.file.buffer.toString("base64");
    task.drinkWaterPhotoBase64 = base64;
    task.imageBase64 = base64;
    task.drinkWaterPhotoUrl = null;
    task.imageUrl = null;
  } else if (imageBase64) {
    task.drinkWaterPhotoBase64 = imageBase64;
    task.imageBase64 = imageBase64;
    task.drinkWaterPhotoUrl = null;
    task.imageUrl = null;
  }

  task.drinkWaterVerified = false; // admin verifies
  recalcCompleted(task);
  await task.save();
  return res.json({ success: true, task });
}

export async function exercise(req, res) {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: "Exercise link is required" });
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const driveRegex = /^(https?:\/\/)?(www\.)?drive\.google\.com\/.+$/;
  if (!youtubeRegex.test(link.trim()) && !driveRegex.test(link.trim())) {
    return res.status(400).json({ error: "Only valid YouTube or Google Drive video links are allowed." });
  }
  const task = await getOrCreateTodayTask(req.user.id);
  task.exerciseLink = link;
  task.exerciseCompleted = true;
  recalcCompleted(task);
  await task.save();
  await maybeUpdateStreak(task, req.user.id);
  return res.json({ success: true, task });
}

export async function dietComplete(req, res) {
  const task = await getOrCreateTodayTask(req.user.id);
  // ensure diet generated today
  const user = await User.findById(req.user.id);
  const todayKey = startOfToday().toISOString().split("T")[0];
  const hasTodayDiet = user?.dietHistory?.some(
    (d) => new Date(d.date).toISOString().split("T")[0] === todayKey
  );
  if (!hasTodayDiet) {
    return res.status(400).json({ error: "Generate today's diet first." });
  }
  task.dietCompleted = true;
  recalcCompleted(task);
  await task.save();
  await maybeUpdateStreak(task, req.user.id);
  return res.json({ success: true, task });
}

export async function todayTask(req, res) {
  const task = await getOrCreateTodayTask(req.user.id);
  return res.json({ success: true, task });
}

