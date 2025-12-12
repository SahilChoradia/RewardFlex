"use strict";
import { Router } from "express";
import { generateDiet } from "../controllers/dietController.js";

const router = Router();

router.post("/generate", generateDiet);

export default router;

