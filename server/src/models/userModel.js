
import pool from "../config/database.js";

// Find user using email
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password, role, is_deleted
    FROM users
    WHERE email = $1
      AND is_deleted = FALSE
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

// Get all users
export const getAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

// Find user by ID
export const findUserById = async (userId) => {
  const query = `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

// Update user details
export const updateUser = async (userId, name, email, role) => {
  const query = `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      role = COALESCE($3, role),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, name, email, role, created_at, updated_at
  `;

  const result = await pool.query(query, [
    name,
    email,
    role,
    userId,
  ]);

  return result.rows[0];
};


// Soft delete user
export const deleteUser = async (userId) => {
  const query = `
    UPDATE users
    SET
      is_deleted = TRUE,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND is_deleted = FALSE
    RETURNING id, name, email, role, is_deleted
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};


// Check whether user account is active
export const isUserActive = async (userId) => {
  const query = `
    SELECT id
    FROM users
    WHERE id = $1
      AND is_deleted = FALSE
  `;

  const result = await pool.query(query, [userId]);

  return result.rowCount > 0;
};
