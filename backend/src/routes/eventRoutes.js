"use strict";
import { Router } from "express";
import {
  listEvents,
  getEventsAll as getEvents,
  getEvent,
  joinEvent,
  createEvent,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", listEvents);
router.get("/all", getEvents);
router.get("/:id", getEvent);
router.post("/:id/join", authMiddleware, joinEvent);

// Admin create
router.post("/create", adminAuth, createEvent);

export default router;

