
import pool from "../config/database.js";

// 1. Create a new project
export const createProject = async (name, description, ownerId) => {
  const query = `
    INSERT INTO projects (name, description, owner_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await pool.query(query, [
    name,
    description,
    ownerId,
  ]);

  return result.rows[0];
};


// 2. Get all projects
export const getAllProjects = async (userId, isAdmin) => {
  let query;
  let values = [];

  if (isAdmin) {
    query = `
      SELECT p.*, u.name AS owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `;
  } else {
    query = `
      SELECT p.*, u.name AS owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = $1
      ORDER BY p.created_at DESC
    `;

    values = [userId];
  }

  const result = await pool.query(query, values);

  return result.rows;
};


// 3. Get a single project
export const getProjectById = async (projectId, userId, isAdmin) => {
  let query;
  let values;

  if (isAdmin) {
    query = `
      SELECT *
      FROM projects
      WHERE id = $1
    `;

    values = [projectId];
  } else {
    query = `
      SELECT *
      FROM projects
      WHERE id = $1 AND owner_id = $2
    `;

    values = [projectId, userId];
  }

  const result = await pool.query(query, values);

  return result.rows[0];
};


// 4. Update a project
export const updateProject = async (
  projectId,
  userId,
  isAdmin,
  name,
  description
) => {
  let query;
  let values;

  if (isAdmin) {
    query = `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    values = [name ?? null, description ?? null, projectId];
  } else {
    query = `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND owner_id = $4
      RETURNING *
    `;

    values = [
      name ?? null,
      description ?? null,
      projectId,
      userId,
    ];
  }

  const result = await pool.query(query, values);

  return result.rows[0];
};


// 5. Delete a project
export const deleteProject = async (projectId, userId, isAdmin) => {
  let query;
  let values;

  if (isAdmin) {
    query = `
      DELETE FROM projects
      WHERE id = $1
      RETURNING *
    `;

    values = [projectId];
  } else {
    query = `
      DELETE FROM projects
      WHERE id = $1 AND owner_id = $2
      RETURNING *
    `;

    values = [projectId, userId];
  }

  const result = await pool.query(query, values);

  return result.rows[0];
};
