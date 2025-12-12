"use strict";
import { Router } from "express";
import { signup, verifyOtp, login, me } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;

