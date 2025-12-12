"use strict";
import { Offer } from "../models/Offer.js";

export async function getAllOffers(_req, res) {
  try {
    const offers = await Offer.find({
      active: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, offers });
  } catch (err) {
    console.error("getAllOffers error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch offers" });
  }
}

// Admin create
export async function createOffer(req, res) {
  try {
    const { title, description, discountPercent, validFrom, validUntil, active = true } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "Title required" });

    const offer = await Offer.create({
      title,
      description,
      discountPercent: discountPercent || 0,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      active,
      createdBy: req.user?.id,
    });

    return res.status(201).json({ success: true, offer });
  } catch (err) {
    console.error("createOffer error:", err);
    return res.status(500).json({ success: false, error: "Failed to create offer" });
  }
}

// Admin update
export async function updateOffer(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.validFrom) updates.validFrom = new Date(updates.validFrom);
    if (updates.validUntil) updates.validUntil = new Date(updates.validUntil);

    const offer = await Offer.findByIdAndUpdate(id, updates, { new: true });
    if (!offer) return res.status(404).json({ success: false, error: "Offer not found" });
    return res.status(200).json({ success: true, offer });
  } catch (err) {
    console.error("updateOffer error:", err);
    return res.status(500).json({ success: false, error: "Failed to update offer" });
  }
}

// Admin delete (soft)
export async function deleteOffer(req, res) {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }

    // Soft delete
    offer.active = false;
    await offer.save();

    return res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (err) {
    console.error("DELETE OFFER ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error while deleting" });
  }
}

// Admin list all
export async function adminListOffers(_req, res) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, offers });
  } catch (err) {
    console.error("adminListOffers error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch offers" });
  }
}

