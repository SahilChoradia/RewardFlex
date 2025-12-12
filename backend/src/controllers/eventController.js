"use strict";
import { Event } from "../models/Event.js";

export async function listEvents(_req, res) {
  const events = await Event.find({}).sort({ createdAt: -1 });
  res.json({ success: true, events });
}

export async function getEvent(req, res) {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ success: true, event });
}

export async function joinEvent(req, res) {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (!event.joinedUsers) event.joinedUsers = [];
  if (!event.joinedUsers.find((u) => u.toString() === req.user.id)) {
    event.joinedUsers.push(req.user.id);
    await event.save();
  }
  res.json({ success: true, message: "Joined event" });
}

// Admin create (supports simplified payload)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, image } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ error: "All fields required" });
    }

    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return res.status(400).json({ error: "Event date must be in the future" });
    }

    const event = await Event.create({
      title,
      description,
      shortDescription: description,
      fullDescription: description,
      date,
      image,
      createdBy: req.user?.id || "admin",
    });
    return res.status(200).json({ success: true, message: "Event created", event });
  } catch (err) {
    console.log("Event Create ERROR =>", err);
    return res.status(500).json({ error: "Server error while creating event" });
  }
};

export async function getEventsAll(_req, res) {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, events });
  } catch (e) {
    return res.status(500).json({ error: "Failed fetching events" });
  }
}

export async function deleteEvent(req, res) {
  const { id } = req.params;
  await Event.findByIdAndDelete(id);
  res.json({ success: true });
}

