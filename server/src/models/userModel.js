
import pool from "../config/database.js";

// Find user using email
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password, role
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};

// Create a new user
export const createUser = async (name, email, hashedPassword) => {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role, created_at
  `;

  const result = await pool.query(query, [
    name,
    email,
    hashedPassword,
  ]);

  return result.rows[0];
};
