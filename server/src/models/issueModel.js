
import pool from "../config/database.js";

// ==========================================
// 1. CREATE ISSUE
// ==========================================

export const createIssue = async ({
  title,
  description,
  priority,
  projectId,
  assignedTo,
  createdBy,
  userRole,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock and check the project
    const projectResult = await client.query(
      `SELECT id
       FROM projects
       WHERE id = $1
       FOR SHARE`,
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "project_not_found" };
    }

    // 2. Admins can create issues in any project.
    // Members must belong to the project.
    if (userRole !== "admin") {
      const accessResult = await client.query(
        `SELECT id
         FROM project_members
         WHERE project_id = $1
           AND user_id = $2`,
        [projectId, createdBy]
      );

      if (accessResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { status: "access_denied" };
      }
    }

    // 3. Validate assignee if provided
    if (assignedTo !== null && assignedTo !== undefined) {
      const assigneeResult = await client.query(
        `SELECT u.id
         FROM users u
         INNER JOIN project_members pm
           ON pm.user_id = u.id
         WHERE u.id = $1
           AND u.role = 'member'
           AND u.is_deleted = FALSE
           AND pm.project_id = $2
         FOR SHARE OF u`,
        [assignedTo, projectId]
      );

      if (assigneeResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { status: "invalid_assignee" };
      }
    }

    // 4. Insert issue
    const issueResult = await client.query(
      `INSERT INTO issues (
        title,
        description,
        priority,
        project_id,
        assigned_to,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        title,
        description ?? null,
        priority ?? "medium",
        projectId,
        assignedTo ?? null,
        createdBy,
      ]
    );

    await client.query("COMMIT");

    return {
      status: "created",
      issue: issueResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ==========================================
// 2. GET ALL ISSUES
// ==========================================

export const getAllIssues = async (user) => {
  let query;
  let values = [];

  if (user.role === "admin") {
    query = `
      SELECT
        i.*,
        p.name AS project_name,
        creator.name AS creator_name,
        assignee.name AS assignee_name
      FROM issues i
      INNER JOIN projects p
        ON p.id = i.project_id
      INNER JOIN users creator
        ON creator.id = i.created_by
      LEFT JOIN users assignee
        ON assignee.id = i.assigned_to
        AND assignee.is_deleted = FALSE
      ORDER BY i.created_at DESC
    `;
  } else {
    query = `
      SELECT
        i.*,
        p.name AS project_name,
        creator.name AS creator_name,
        assignee.name AS assignee_name
      FROM issues i
      INNER JOIN projects p
        ON p.id = i.project_id
      INNER JOIN users creator
        ON creator.id = i.created_by
      LEFT JOIN users assignee
        ON assignee.id = i.assigned_to
        AND assignee.is_deleted = FALSE
      INNER JOIN project_members pm
        ON pm.project_id = i.project_id
      WHERE pm.user_id = $1
      ORDER BY i.created_at DESC
    `;

    values = [user.id];
  }

  const result = await pool.query(query, values);

  return result.rows;
};

// ==========================================
// 3. GET ISSUE BY ID
// ==========================================

export const getIssueById = async (issueId, user) => {
  let query;
  let values;

  if (user.role === "admin") {
    query = `
      SELECT
        i.*,
        p.name AS project_name,
        creator.name AS creator_name,
        assignee.name AS assignee_name
      FROM issues i
      INNER JOIN projects p
        ON p.id = i.project_id
      INNER JOIN users creator
        ON creator.id = i.created_by
      LEFT JOIN users assignee
        ON assignee.id = i.assigned_to
        AND assignee.is_deleted = FALSE
      WHERE i.id = $1
    `;

    values = [issueId];
  } else {
    query = `
      SELECT
        i.*,
        p.name AS project_name,
        creator.name AS creator_name,
        assignee.name AS assignee_name
      FROM issues i
      INNER JOIN projects p
        ON p.id = i.project_id
      INNER JOIN users creator
        ON creator.id = i.created_by
      LEFT JOIN users assignee
        ON assignee.id = i.assigned_to
        AND assignee.is_deleted = FALSE
      INNER JOIN project_members pm
        ON pm.project_id = i.project_id
      WHERE i.id = $1
        AND pm.user_id = $2
    `;

    values = [issueId, user.id];
  }

  const result = await pool.query(query, values);

  return result.rows[0] || null;
};

// ==========================================
// 4. UPDATE ISSUE
// ==========================================

export const updateIssue = async (issueId, user, updates) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Find the issue's project
    const projectReference = await client.query(
      `SELECT project_id
       FROM issues
       WHERE id = $1`,
      [issueId]
    );

    if (projectReference.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    const projectId = projectReference.rows[0].project_id;

    // 2. Lock project to coordinate with membership changes
    const projectResult = await client.query(
      `SELECT id
       FROM projects
       WHERE id = $1
       FOR SHARE`,
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    // 3. Lock the issue
    const issueResult = await client.query(
      `SELECT *
       FROM issues
       WHERE id = $1
       FOR UPDATE`,
      [issueId]
    );

    if (issueResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    const issue = issueResult.rows[0];

    // 4. Check project access for members
    if (user.role !== "admin") {
      const accessResult = await client.query(
        `SELECT id
         FROM project_members
         WHERE project_id = $1
           AND user_id = $2`,
        [issue.project_id, user.id]
      );

      if (accessResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { status: "access_denied" };
      }
    }

    // 5. Validate new assignee
    if (
      updates.assignedTo !== undefined &&
      updates.assignedTo !== null
    ) {
      const assigneeResult = await client.query(
        `SELECT u.id
         FROM users u
         INNER JOIN project_members pm
           ON pm.user_id = u.id
         WHERE u.id = $1
           AND u.role = 'member'
           AND u.is_deleted = FALSE
           AND pm.project_id = $2
         FOR SHARE OF u`,
        [updates.assignedTo, issue.project_id]
      );

      if (assigneeResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return { status: "invalid_assignee" };
      }
    }

    // 6. Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;

    const fieldMapping = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      assignedTo: "assigned_to",
    };

    for (const [key, column] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        fields.push(`${column} = $${index}`);
        values.push(updates[key]);
        index++;
      }
    }

    if (fields.length === 0) {
      await client.query("ROLLBACK");
      return { status: "no_changes" };
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");

    values.push(issueId);

    const updateQuery = `
      UPDATE issues
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    const updatedResult = await client.query(
      updateQuery,
      values
    );

    await client.query("COMMIT");

    return {
      status: "updated",
      issue: updatedResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ==========================================
// 5. DELETE ISSUE
// ==========================================

export const deleteIssue = async (issueId) => {
  const result = await pool.query(
    `DELETE FROM issues
     WHERE id = $1
     RETURNING *`,
    [issueId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
};
