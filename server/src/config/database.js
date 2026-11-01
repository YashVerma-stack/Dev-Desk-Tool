
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Check database connection
export const connectDB = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully");
    console.log("Database time:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    throw error;
  }
};

// Handle unexpected pool errors
pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;
