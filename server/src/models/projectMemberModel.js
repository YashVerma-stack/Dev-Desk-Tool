import pool from "../config/database.js";

export const assignMembersToProject = async (projectId, memberIds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock project
    const projectResult = await client.query(
      `SELECT id FROM projects WHERE id = $1 FOR UPDATE`,
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "project_not_found" };
    }

    const assignedMembers = [];

    // Assign all selected members
for (const memberId of memberIds) {
  // Check whether the member exists and is active
  const memberResult = await client.query(
    `SELECT id
     FROM users
     WHERE id = $1
       AND role = 'member'
       AND is_deleted = FALSE
     FOR SHARE`,
    [memberId]
  );

  // Reject the entire transaction if member is invalid
  if (memberResult.rowCount === 0) {
    await client.query("ROLLBACK");

    return {
      status: "invalid_member",
      memberId,
    };
  }

  // Insert the valid member
  const result = await client.query(
    `INSERT INTO project_members (project_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (project_id, user_id) DO NOTHING
     RETURNING *`,
    [projectId, memberId]
  );

  if (result.rows[0]) {
    assignedMembers.push(result.rows[0]);
  }
}

    await client.query("COMMIT");

    return {
      status: "assigned",
      assignedMembers,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getProjectMembers = async (projectId) => {
  const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      pm.assigned_at
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = $1
      AND u.is_deleted = FALSE
    ORDER BY pm.assigned_at ASC
  `;

  const result = await pool.query(query, [projectId]);

  return result.rows;
};

export const removeMemberFromProject = async (projectId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock project to prevent simultaneous member removals
    const projectResult = await client.query(
      `SELECT id FROM projects WHERE id = $1 FOR UPDATE`,
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "project_not_found" };
    }

    // Check whether member is assigned
    const assignmentResult = await client.query(
      `SELECT pm.id
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
         AND pm.user_id = $2
         AND u.is_deleted = FALSE
       FOR UPDATE OF pm`,
      [projectId, userId]
    );

    if (assignmentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "assignment_not_found" };
    }

    // Count active project members
    const countResult = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
         AND u.is_deleted = FALSE`,
      [projectId]
    );

    if (countResult.rows[0].total <= 1) {
      await client.query("ROLLBACK");
      return { status: "last_member" };
    }

    // Remove assignment
    const deleteResult = await client.query(
      `DELETE FROM project_members
       WHERE project_id = $1 AND user_id = $2
       RETURNING *`,
      [projectId, userId]
    );

    await client.query("COMMIT");

    return {
      status: "removed",
      assignment: deleteResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getMemberProjects = async (userId) => {
  const query = `
    SELECT
      p.*,
      u.name AS owner_name,
      pm.assigned_at
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    JOIN users u ON p.owner_id = u.id
    JOIN users member ON pm.user_id = member.id
    WHERE pm.user_id = $1
      AND member.is_deleted = FALSE
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};

