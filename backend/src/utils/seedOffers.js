"use strict";
import { Offer } from "../models/Offer.js";

export async function seedOffers() {
  try {
    const count = await Offer.countDocuments();
    if (count === 0) {
      await Offer.create({
        title: "New Year Discount",
        description: "Get 20% off on yearly subscription",
        discountPercent: 20,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        active: true,
      });
      console.log("Seeded default offer");
    }
  } catch (err) {
    console.error("seedOffers error:", err);
  }
}

