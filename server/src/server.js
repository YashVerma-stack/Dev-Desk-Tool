
import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect PostgreSQL first
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`DevDesk server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
