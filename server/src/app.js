import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import issueRoutes from "./routes/issueRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import authenticate from "./middleware/authMiddleware.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse incoming requests
app.use(express.json());
app.use(cookieParser());

// Health check API
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DevDesk API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/projects", authenticate, projectRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/issues", authenticate, issueRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);

export default app;