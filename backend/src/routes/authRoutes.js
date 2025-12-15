"use strict";
import { Router } from "express";
import { signup, verifyOtp, login, me, resendOtp, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;

