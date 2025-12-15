"use strict";
import { Router } from "express";
import {
  // Dashboard Stats
  adminStats,
  // Water verification
  pendingWater,
  approveWater,
  rejectWater,
  // Leaderboard & Rank
  adminLeaderboard,
  // Users CRUD
  adminUsers,
  adminMembers,
  adminMemberDetail,
  adminUpdateUser,
  adminDeleteUser,
  // Events CRUD
  adminGetEvents,
  adminGetEvent,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  // Offers CRUD
  adminGetOffers,
  adminGetOffer,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
  // Subscription Plans CRUD
  adminGetSubscriptionPlans,
  adminGetSubscriptionPlan,
  adminCreateSubscriptionPlan,
  adminUpdateSubscriptionPlan,
  adminDeleteSubscriptionPlan,
  // Task Templates CRUD
  adminGetTaskTemplates,
  adminGetTaskTemplate,
  adminCreateTaskTemplate,
  adminUpdateTaskTemplate,
  adminDeleteTaskTemplate,
} from "../controllers/adminController.js";

const router = Router();

// ========== DASHBOARD STATS ==========
router.get("/stats", adminStats);

// ========== WATER VERIFICATION ==========
router.get("/water-pending", pendingWater);
router.get("/pending-water", pendingWater); // alias
router.post("/approve-water/:taskId", approveWater);
router.post("/reject-water/:taskId", rejectWater);
router.post("/water/approve/:taskId", approveWater);
router.post("/water/reject/:taskId", rejectWater);

// ========== LEADERBOARD & RANK ==========
router.get("/leaderboard", adminLeaderboard);

// ========== USERS CRUD ==========
router.get("/users", adminUsers);
router.get("/members", adminMembers);
router.get("/member/:id", adminMemberDetail);
router.put("/users/:id", adminUpdateUser);
router.delete("/users/:id", adminDeleteUser);

// ========== EVENTS CRUD ==========
router.get("/events", adminGetEvents);
router.get("/events/:id", adminGetEvent);
router.post("/events", adminCreateEvent);
router.put("/events/:id", adminUpdateEvent);
router.delete("/events/:id", adminDeleteEvent);

// ========== OFFERS CRUD ==========
router.get("/offers", adminGetOffers);
router.get("/offers/:id", adminGetOffer);
router.post("/offers", adminCreateOffer);
router.put("/offers/:id", adminUpdateOffer);
router.delete("/offers/:id", adminDeleteOffer);

// ========== SUBSCRIPTION PLANS CRUD ==========
router.get("/subscription-plans", adminGetSubscriptionPlans);
router.get("/subscription-plans/:id", adminGetSubscriptionPlan);
router.post("/subscription-plans", adminCreateSubscriptionPlan);
router.put("/subscription-plans/:id", adminUpdateSubscriptionPlan);
router.delete("/subscription-plans/:id", adminDeleteSubscriptionPlan);

// ========== TASK TEMPLATES CRUD ==========
router.get("/task-templates", adminGetTaskTemplates);
router.get("/task-templates/:id", adminGetTaskTemplate);
router.post("/task-templates", adminCreateTaskTemplate);
router.put("/task-templates/:id", adminUpdateTaskTemplate);
router.delete("/task-templates/:id", adminDeleteTaskTemplate);

export default router;
