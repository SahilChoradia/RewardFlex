"use strict";
import { Router } from "express";
import { listRewards, claimReward } from "../controllers/rewardController.js";

const router = Router();

router.get("/", listRewards);
router.post("/claim", claimReward);

export default router;

