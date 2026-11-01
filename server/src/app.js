import authRoutes from "./routes/authRoutes.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevDesk API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);

export default app;
