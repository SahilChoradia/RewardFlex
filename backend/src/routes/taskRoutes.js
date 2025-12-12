"use strict";
import { Router } from "express";
import {
  wakeup,
  drinkWater,
  exercise,
  dietComplete,
  todayTask,
  waterUpload,
} from "../controllers/taskController.js";

const router = Router();

router.get("/today", todayTask);
router.post("/wakeup", wakeup);
router.post("/drink-water", waterUpload.single("photo"), drinkWater);
router.post("/exercise", exercise);
router.post("/diet-complete", dietComplete);

export default router;

