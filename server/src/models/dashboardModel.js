
import pool from "../config/database.js";

// GET DASHBOARD OVERVIEW
export const getDashboardOverview = async (user) => {
  let query;
  let values = [];

  if (user.role === "admin") {
    query = `
      SELECT
        (SELECT COUNT(*)
         FROM users
         WHERE is_deleted = FALSE) AS total_users,

        (SELECT COUNT(*)
         FROM projects) AS total_projects,

        (SELECT COUNT(*)
         FROM issues) AS total_issues
    `;
  } else {
    query = `
      SELECT
        (SELECT COUNT(*)
         FROM project_members pm
         INNER JOIN projects p ON p.id = pm.project_id
         WHERE pm.user_id = $1) AS total_projects,

        (SELECT COUNT(*)
         FROM issues i
         INNER JOIN project_members pm
           ON pm.project_id = i.project_id
         WHERE pm.user_id = $1) AS total_issues
    `;

    values = [user.id];
  }

  const result = await pool.query(query, values);

  return result.rows[0];
};

// GET DASHBOARD ISSUE STATISTICS
export const getDashboardIssueStats = async (user) => {
  let values = [];

  if (user.role !== "admin") {
    values = [user.id];
  }

  // STATUS STATISTICS
  const statusQuery = `
    SELECT
      statuses.status,
      COUNT(i.id) AS total
    FROM (
      SELECT unnest(
        ARRAY['open', 'in_progress', 'resolved', 'closed']
      ) AS status
    ) AS statuses
    LEFT JOIN issues i
      ON i.status = statuses.status
      ${user.role === "admin" ? "" : `
        AND EXISTS (
          SELECT 1
          FROM project_members pm
          WHERE pm.project_id = i.project_id
            AND pm.user_id = $1
        )
      `}
    GROUP BY statuses.status
    ORDER BY statuses.status
  `;

  const statusResult = await pool.query(statusQuery, values);

  // PRIORITY STATISTICS
  const priorityQuery = `
    SELECT
      priorities.priority,
      COUNT(i.id) AS total
    FROM (
      SELECT unnest(
        ARRAY['critical', 'high', 'medium', 'low']
      ) AS priority
    ) AS priorities
    LEFT JOIN issues i
      ON i.priority = priorities.priority
      ${user.role === "admin" ? "" : `
        AND EXISTS (
          SELECT 1
          FROM project_members pm
          WHERE pm.project_id = i.project_id
            AND pm.user_id = $1
        )
      `}
    GROUP BY priorities.priority
    ORDER BY
      CASE priorities.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
  `;

  const priorityResult = await pool.query(priorityQuery, values);

  return {
    statusStats: statusResult.rows,
    priorityStats: priorityResult.rows,
  };
};

// GET DASHBOARD PROJECT STATISTICS
export const getDashboardProjectStats = async (user) => {
  let query;
  let values = [];

  if (user.role === "admin") {
    query = `
      SELECT
        p.id AS project_id,
        p.name AS project_name,
        COUNT(i.id) AS total_issues
      FROM projects p
      LEFT JOIN issues i
        ON i.project_id = p.id
      GROUP BY p.id, p.name
      ORDER BY p.id DESC
    `;
  } else {
    query = `
      SELECT
        p.id AS project_id,
        p.name AS project_name,
        COUNT(i.id) AS total_issues
      FROM projects p
      INNER JOIN project_members pm
        ON pm.project_id = p.id
      LEFT JOIN issues i
        ON i.project_id = p.id
      WHERE pm.user_id = $1
      GROUP BY p.id, p.name
      ORDER BY p.id DESC
    `;

    values = [user.id];
  }

  const result = await pool.query(query, values);

  return result.rows;
};
