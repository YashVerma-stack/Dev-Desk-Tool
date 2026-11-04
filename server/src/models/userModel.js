
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
    SELECT
      id,
      name,
      email,
      role,
      is_deleted,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

// Find user by ID
export const findUserById = async (userId) => {
  const query = `
  SELECT id, name, email, role, is_deleted, created_at, updated_at
  FROM users
  WHERE id = $1
`;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

// Update user details


export const updateUser = async (userId, name, email, role) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock all projects currently assigned to this user
    const projectResult = await client.query(
      `SELECT p.id
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.id
       FOR UPDATE OF p`,
      [userId]
    );

    // Lock the user after locking projects
    const userResult = await client.query(
      `SELECT id, role, is_deleted
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    const currentUser = userResult.rows[0];

    // Prevent an assigned active member from becoming an admin
    if (
      currentUser.role === "member" &&
      role === "admin" &&
      !currentUser.is_deleted &&
      projectResult.rowCount > 0
    ) {
      await client.query("ROLLBACK");
      return { status: "assigned_member" };
    }

    // Update user details
    const result = await client.query(
      `UPDATE users
       SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, role, userId]
    );

    await client.query("COMMIT");

    return {
      status: "updated",
      user: result.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};



// Soft delete user safely
export const deleteUser = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find projects where this user is an active member
    const projectResult = await client.query(
      `SELECT p.id
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      WHERE pm.user_id = $1
      ORDER BY p.id
      FOR UPDATE OF p`,
      [userId]
    );

    // Check each affected project
    for (const project of projectResult.rows) {
      const countResult = await client.query(
        `SELECT COUNT(*)::int AS total
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1
           AND u.is_deleted = FALSE`,
        [project.id]
      );

      if (countResult.rows[0].total <= 1) {
        await client.query("ROLLBACK");

        return {
          status: "last_member",
        };
      }
    }

    // Soft delete the user
    const result = await client.query(
      `UPDATE users
       SET is_deleted = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND is_deleted = FALSE
       RETURNING id, name, email, role, is_deleted`,
      [userId]
    );

    await client.query("COMMIT");

    return {
      status: "deleted",
      user: result.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

// Get logged-in user's profile
export const getUserProfile = async (userId) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
      AND is_deleted = FALSE
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

// Update logged-in user's profile
export const updateUserProfile = async (
  userId,
  name,
  email
) => {
  const query = `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
      AND is_deleted = FALSE
    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [
    name,
    email,
    userId,
  ]);

  return result.rows[0];
};

// GET user's current hashed password
export const getUserPassword = async (userId) => {
  const query = `
    SELECT password
    FROM users
    WHERE id = $1
      AND is_deleted = FALSE
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

// UPDATE user's password
export const updateUserPassword = async (userId, hashedPassword) => {
  const query = `
    UPDATE users
    SET password = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND is_deleted = FALSE
    RETURNING id, name, email, role, updated_at
  `;

  const result = await pool.query(query, [hashedPassword, userId]);

  return result.rows[0];
};


// RESTORE a soft-deleted user
export const restoreUser = async (userId) => {
  const query = `
    UPDATE users
    SET is_deleted = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND is_deleted = TRUE
    RETURNING id, name, email, role, is_deleted, updated_at
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

// CHECK whether a user is an active member
export const isActiveMember = async (userId) => {
  const query = `
    SELECT id
    FROM users
    WHERE id = $1
      AND role = 'member'
      AND is_deleted = FALSE
  `;

  const result = await pool.query(query, [userId]);

  return result.rowCount > 0;
};


// GET USER WORK DETAILS (ADMIN VIEW)
export const getUserWorkDetails = async (userId) => {
  // 1. Get user information
  const userQuery = `
    SELECT
      id,
      name,
      email,
      role,
      is_deleted,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
  `;

  // 2. Get projects assigned to the user
  const projectsQuery = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.owner_id,
      owner.name AS owner_name,
      pm.assigned_at,
      p.created_at,
      p.updated_at
    FROM project_members pm
    INNER JOIN projects p
      ON p.id = pm.project_id
    INNER JOIN users owner
      ON owner.id = p.owner_id
    WHERE pm.user_id = $1
    ORDER BY pm.assigned_at DESC
  `;

  // 3. Get issues assigned to the user
  const issuesQuery = `
    SELECT
      i.id,
      i.title,
      i.description,
      i.status,
      i.priority,
      i.project_id,
      p.name AS project_name,
      i.created_by,
      creator.name AS creator_name,
      i.created_at,
      i.updated_at
    FROM issues i
    INNER JOIN projects p
      ON p.id = i.project_id
    LEFT JOIN users creator
      ON creator.id = i.created_by
    WHERE i.assigned_to = $1
    ORDER BY i.created_at DESC
  `;

  // Execute all queries
  const [userResult, projectsResult, issuesResult] =
    await Promise.all([
      pool.query(userQuery, [userId]),
      pool.query(projectsQuery, [userId]),
      pool.query(issuesQuery, [userId]),
    ]);

  if (userResult.rowCount === 0) {
    return null;
  }

  return {
    user: userResult.rows[0],
    projects: projectsResult.rows,
    assignedIssues: issuesResult.rows,
  };
};

// GET IDs OF ALL ACTIVE ADMINS
export const getActiveAdminIds = async () => {
  const query = `
    SELECT id
    FROM users
    WHERE role = 'admin'
      AND is_deleted = FALSE
  `;

  const result = await pool.query(query);

  return result.rows.map((admin) => admin.id);
};