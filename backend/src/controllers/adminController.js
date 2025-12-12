"use strict";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Offer } from "../models/Offer.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";
import { TaskTemplate } from "../models/TaskTemplate.js";
import { getRankFromStreak } from "../utils/rank.js";
import mongoose from "mongoose";

// ========== WATER VERIFICATION ==========
export async function pendingWater(_req, res) {
  try {
    const tasks = await Task.find({
      type: "water",
      $or: [{ status: "pending" }, { drinkWaterVerified: false }],
    })
      .populate("userId", "name email streak rank")
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    console.error("pendingWater error:", err);
    res.status(500).json({ error: "Failed to fetch pending water tasks" });
  }
}

async function recalcAndMaybeStreak(task) {
  let count = 0;
  if (task.wakeupCompleted) count++;
  if (task.exerciseCompleted) count++;
  if (task.dietCompleted) count++;
  if (task.drinkWaterVerified) count++;
  task.completedCount = count;
  await task.save();
  if (count === 4) {
    const user = await User.findById(task.userId);
    if (user) {
      user.streak = (user.streak || 0) + 1;
      user.rank = getRankFromStreak(user.streak);
      await user.save();
    }
  }
}

export async function approveWater(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.drinkWaterVerified = true;
    task.status = "approved";
    await recalcAndMaybeStreak(task);
    res.json({ success: true, task });
  } catch (err) {
    console.error("approveWater error:", err);
    res.status(500).json({ error: "Failed to approve water task" });
  }
}

export async function rejectWater(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.drinkWaterPhotoUrl = null;
    task.drinkWaterPhotoBase64 = null;
    task.imageUrl = null;
    task.imageBase64 = null;
    task.drinkWaterVerified = false;
    task.status = "rejected";
    await recalcAndMaybeStreak(task);
    res.json({ success: true, task });
  } catch (err) {
    console.error("rejectWater error:", err);
    res.status(500).json({ error: "Failed to reject water task" });
  }
}

// ========== LEADERBOARD & RANK ==========
export async function adminLeaderboard(_req, res) {
  try {
    const users = await User.find({}, "name email streak rank role")
      .sort({ streak: -1 })
      .limit(100);
    res.json({ success: true, users });
  } catch (err) {
    console.error("adminLeaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

// ========== USERS CRUD ==========
export async function adminUsers(_req, res) {
  try {
    const users = await User.find({}, "name email streak rank role verified createdAt subscription").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error("adminUsers error:", err);
    res.status(500).json({ error: "Failed to load users" });
  }
}

export async function adminMembers(_req, res) {
  try {
    const users = await User.find({});
    return res.json({ success: true, users });
  } catch (err) {
    console.error("adminMembers error:", err);
    return res.status(500).json({ error: "Failed to load members" });
  }
}

export async function adminMemberDetail(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const user = await User.findById(id).populate("tasks");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ success: true, user });
  } catch (err) {
    console.error("adminMemberDetail error:", err);
    return res.status(500).json({ error: "Failed to load member" });
  }
}

export async function adminUpdateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, streak, rank, verified } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ["member", "admin"].includes(role)) user.role = role;
    if (typeof streak === "number") user.streak = streak;
    if (rank && ["Bronze", "Silver", "Gold", "Platinum"].includes(rank)) user.rank = rank;
    if (typeof verified === "boolean") user.verified = verified;
    
    await user.save();
    return res.json({ success: true, user });
  } catch (err) {
    console.error("adminUpdateUser error:", err);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

export async function adminDeleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("adminDeleteUser error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

// ========== EVENTS CRUD ==========
export async function adminGetEvents(_req, res) {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error("adminGetEvents error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

export async function adminGetEvent(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true, event });
  } catch (err) {
    console.error("adminGetEvent error:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
}

export async function adminCreateEvent(req, res) {
  try {
    const { title, description, shortDescription, fullDescription, date, image, discountPercent, location } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ error: "Title, description, and date are required" });
    }
    const event = await Event.create({
      title,
      description,
      shortDescription: shortDescription || description,
      fullDescription: fullDescription || description,
      date,
      image,
      discountPercent: discountPercent || 0,
      location,
      createdBy: req.user?.id || "admin",
    });
    res.json({ success: true, event });
  } catch (err) {
    console.error("adminCreateEvent error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
}

export async function adminUpdateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, shortDescription, fullDescription, date, image, discountPercent, location } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (shortDescription !== undefined) event.shortDescription = shortDescription;
    if (fullDescription !== undefined) event.fullDescription = fullDescription;
    if (date) event.date = date;
    if (image !== undefined) event.image = image;
    if (discountPercent !== undefined) event.discountPercent = discountPercent;
    if (location !== undefined) event.location = location;
    
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    console.error("adminUpdateEvent error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
}

export async function adminDeleteEvent(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("adminDeleteEvent error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
}

// ========== OFFERS CRUD ==========
export async function adminGetOffers(_req, res) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json({ success: true, offers });
  } catch (err) {
    console.error("adminGetOffers error:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
}

export async function adminGetOffer(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ success: true, offer });
  } catch (err) {
    console.error("adminGetOffer error:", err);
    res.status(500).json({ error: "Failed to fetch offer" });
  }
}

export async function adminCreateOffer(req, res) {
  try {
    const { title, description, discountPercent, code, startDate, endDate, image, isActive } = req.body;
    if (!title || !description || !discountPercent || !startDate || !endDate) {
      return res.status(400).json({ error: "Title, description, discountPercent, startDate, and endDate are required" });
    }
    const offer = await Offer.create({
      title,
      description,
      discountPercent,
      code,
      startDate,
      endDate,
      image,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id || "admin",
    });
    res.json({ success: true, offer });
  } catch (err) {
    console.error("adminCreateOffer error:", err);
    res.status(500).json({ error: "Failed to create offer" });
  }
}

export async function adminUpdateOffer(req, res) {
  try {
    const { id } = req.params;
    const { title, description, discountPercent, code, startDate, endDate, image, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    
    if (title) offer.title = title;
    if (description) offer.description = description;
    if (discountPercent !== undefined) offer.discountPercent = discountPercent;
    if (code !== undefined) offer.code = code;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;
    if (image !== undefined) offer.image = image;
    if (isActive !== undefined) offer.isActive = isActive;
    
    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error("adminUpdateOffer error:", err);
    res.status(500).json({ error: "Failed to update offer" });
  }
}

export async function adminDeleteOffer(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await Offer.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Offer not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("adminDeleteOffer error:", err);
    res.status(500).json({ error: "Failed to delete offer" });
  }
}

// ========== SUBSCRIPTION PLANS CRUD ==========
export async function adminGetSubscriptionPlans(_req, res) {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (err) {
    console.error("adminGetSubscriptionPlans error:", err);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
}

export async function adminGetSubscriptionPlan(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) return res.status(404).json({ error: "Subscription plan not found" });
    res.json({ success: true, plan });
  } catch (err) {
    console.error("adminGetSubscriptionPlan error:", err);
    res.status(500).json({ error: "Failed to fetch subscription plan" });
  }
}

export async function adminCreateSubscriptionPlan(req, res) {
  try {
    const { name, description, price, currency, duration, features, isActive } = req.body;
    if (!name || !description || !price || !duration) {
      return res.status(400).json({ error: "Name, description, price, and duration are required" });
    }
    const plan = await SubscriptionPlan.create({
      name,
      description,
      price,
      currency: currency || "INR",
      duration,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id || "admin",
    });
    res.json({ success: true, plan });
  } catch (err) {
    console.error("adminCreateSubscriptionPlan error:", err);
    res.status(500).json({ error: "Failed to create subscription plan" });
  }
}

export async function adminUpdateSubscriptionPlan(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, currency, duration, features, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) return res.status(404).json({ error: "Subscription plan not found" });
    
    if (name) plan.name = name;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (currency) plan.currency = currency;
    if (duration !== undefined) plan.duration = duration;
    if (features !== undefined) plan.features = features;
    if (isActive !== undefined) plan.isActive = isActive;
    
    await plan.save();
    res.json({ success: true, plan });
  } catch (err) {
    console.error("adminUpdateSubscriptionPlan error:", err);
    res.status(500).json({ error: "Failed to update subscription plan" });
  }
}

export async function adminDeleteSubscriptionPlan(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await SubscriptionPlan.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Subscription plan not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("adminDeleteSubscriptionPlan error:", err);
    res.status(500).json({ error: "Failed to delete subscription plan" });
  }
}

// ========== TASK TEMPLATES CRUD ==========
export async function adminGetTaskTemplates(_req, res) {
  try {
    const templates = await TaskTemplate.find().sort({ type: 1, createdAt: -1 });
    res.json({ success: true, templates });
  } catch (err) {
    console.error("adminGetTaskTemplates error:", err);
    res.status(500).json({ error: "Failed to fetch task templates" });
  }
}

export async function adminGetTaskTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const template = await TaskTemplate.findById(id);
    if (!template) return res.status(404).json({ error: "Task template not found" });
    res.json({ success: true, template });
  } catch (err) {
    console.error("adminGetTaskTemplate error:", err);
    res.status(500).json({ error: "Failed to fetch task template" });
  }
}

export async function adminCreateTaskTemplate(req, res) {
  try {
    const { title, description, type, points, requiresVerification, isActive } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({ error: "Title, description, and type are required" });
    }
    if (!["water", "exercise", "diet", "wakeup"].includes(type)) {
      return res.status(400).json({ error: "Invalid task type" });
    }
    const template = await TaskTemplate.create({
      title,
      description,
      type,
      points: points || 1,
      requiresVerification: requiresVerification !== undefined ? requiresVerification : false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id || "admin",
    });
    res.json({ success: true, template });
  } catch (err) {
    console.error("adminCreateTaskTemplate error:", err);
    res.status(500).json({ error: "Failed to create task template" });
  }
}

export async function adminUpdateTaskTemplate(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, points, requiresVerification, isActive } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    
    const template = await TaskTemplate.findById(id);
    if (!template) return res.status(404).json({ error: "Task template not found" });
    
    if (title) template.title = title;
    if (description) template.description = description;
    if (type && ["water", "exercise", "diet", "wakeup"].includes(type)) template.type = type;
    if (points !== undefined) template.points = points;
    if (requiresVerification !== undefined) template.requiresVerification = requiresVerification;
    if (isActive !== undefined) template.isActive = isActive;
    
    await template.save();
    res.json({ success: true, template });
  } catch (err) {
    console.error("adminUpdateTaskTemplate error:", err);
    res.status(500).json({ error: "Failed to update task template" });
  }
}

export async function adminDeleteTaskTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const deleted = await TaskTemplate.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Task template not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("adminDeleteTaskTemplate error:", err);
    res.status(500).json({ error: "Failed to delete task template" });
  }
}
