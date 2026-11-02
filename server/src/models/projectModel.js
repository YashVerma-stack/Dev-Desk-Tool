
import {
  getMemberProjects,
} from "./projectMemberModel.js";

import pool from "../config/database.js";

// 1. Create a project and assign multiple members using a transaction

export const createProjectWithMembers = async (
  name,
  description,
  adminId,
  memberIds
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Validate and lock every selected member
    for (const memberId of memberIds) {
      const memberResult = await client.query(
        `SELECT id
         FROM users
         WHERE id = $1
           AND role = 'member'
           AND is_deleted = FALSE
         FOR SHARE`,
        [memberId]
      );

      // Roll back if any selected member is invalid
      if (memberResult.rowCount === 0) {
        await client.query("ROLLBACK");

        return {
          status: "invalid_member",
          memberId,
        };
      }
    }

    // Create project only after all members are validated
    const projectResult = await client.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, adminId]
    );

    const project = projectResult.rows[0];

    // Assign all validated members
    for (const memberId of memberIds) {
      await client.query(
        `INSERT INTO project_members (project_id, user_id)
         VALUES ($1, $2)`,
        [project.id, memberId]
      );
    }

    await client.query("COMMIT");

    return {
      status: "created",
      project,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};



// 2. Get all projects
export const getAllProjects = async (userId, isAdmin) => {
  if (isAdmin) {
    const query = `
      SELECT p.*, u.name AS owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  return await getMemberProjects(userId);
};


// 3. Get a single project
export const getProjectById = async (projectId, userId, isAdmin) => {
  let query;
  let values;

  if (isAdmin) {
    query = `
      SELECT p.*, u.name AS owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `;

    values = [projectId];
  } else {
    query = `
      SELECT p.*, u.name AS owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
        AND EXISTS (
          SELECT 1
          FROM project_members pm
          WHERE pm.project_id = p.id
            AND pm.user_id = $2
        )
    `;

    values = [projectId, userId];
  }

  const result = await pool.query(query, values);

  return result.rows[0];
};


// 4. Update a project (Admin only)
export const updateProject = async (
  projectId,
  name,
  description
) => {
  const query = `
    UPDATE projects
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [
    name ?? null,
    description ?? null,
    projectId,
  ]);

  return result.rows[0];
};


// 5. Delete a project (Admin only)
export const deleteProject = async (projectId) => {
  const query = `
    DELETE FROM projects
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [projectId]);

  return result.rows[0];
};
