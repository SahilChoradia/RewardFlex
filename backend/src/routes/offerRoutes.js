"use strict";
import express from "express";
import { getAllOffers, createOffer, updateOffer, deleteOffer, adminListOffers } from "../controllers/offerController.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Public offers for members & visitors
router.get("/all", getAllOffers);

// Admin CRUD
router.post("/admin/create", authMiddleware, requireRole(["admin"]), createOffer);
router.put("/admin/:id", authMiddleware, requireRole(["admin"]), updateOffer);
router.delete("/admin/:id", authMiddleware, requireRole(["admin"]), deleteOffer);
router.get("/admin/all", authMiddleware, requireRole(["admin"]), adminListOffers);

export default router;

