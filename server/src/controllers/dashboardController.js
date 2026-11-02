import { getDashboardOverview, getDashboardProjectStats, getDashboardIssueStats } from "../models/dashboardModel.js";

// GET DASHBOARD OVERVIEW
export const getDashboardOverviewController = async (req, res) => {
  try {
    const overview = await getDashboardOverview(req.user);

    return res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
    });
  }

};

// GET DASHBOARD ISSUE STATISTICS
export const getDashboardIssueStatsController = async (req, res) => {
  try {
    const issueStats = await getDashboardIssueStats(req.user);

    return res.status(200).json({
      success: true,
      issueStats,
    });
  } catch (error) {
    console.error("Dashboard issue statistics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard issue statistics",
    });
  }
};

// GET DASHBOARD PROJECT STATISTICS
export const getDashboardProjectStatsController = async (req, res) => {
  try {
    const projectStats = await getDashboardProjectStats(req.user);

    return res.status(200).json({
      success: true,
      projectStats,
    });
  } catch (error) {
    console.error("Dashboard project statistics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard project statistics",
    });
  }
};