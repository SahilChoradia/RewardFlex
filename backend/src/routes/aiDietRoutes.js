"use strict";
import express from "express";
import { generateDiet } from "../controllers/aiDietController.js";

const router = express.Router();

router.post("/diet", generateDiet);

export default router;

