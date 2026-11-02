import express from "express";

import {
  getDashboardOverviewController,
  getDashboardIssueStatsController,
  getDashboardProjectStatsController,
} from "../controllers/dashboardController.js";

const router = express.Router();

// GET DASHBOARD OVERVIEW
router.get("/overview", getDashboardOverviewController);

// GET DASHBOARD ISSUE STATISTICS
router.get("/issues", getDashboardIssueStatsController);

// GET DASHBOARD PROJECT STATISTICS
router.get("/projects", getDashboardProjectStatsController);

export default router;