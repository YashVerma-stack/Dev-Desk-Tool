# Dashboard Module

## Overview

The Dashboard module provides a centralized view of project and issue information in the DevDesk Issue Tracker.

It supports two roles:

- **Admin:** Can view overall system statistics, including all users, projects, and issues.
- **Member:** Can view statistics only for projects assigned to them and the issues belonging to those projects.

The module helps users monitor project activity, issue distribution, and overall progress.

## Features

### 1. Dashboard Overview

Provides summary counts.

**Admin statistics:**
- Total active users.
- Total projects.
- Total issues.

**Member statistics:**
- Total assigned projects.
- Total issues within assigned projects.

### 2. Issue Statistics

Groups issues by their status and priority.

**Status categories:**
- Open
- In Progress
- Resolved
- Closed

**Priority categories:**
- Critical
- High
- Medium
- Low

All categories are returned even when their issue count is zero. This provides consistent data for frontend charts and visualizations.

### 3. Project Statistics

Provides issue counts for individual projects.

Each project includes:
- Project ID.
- Project name.
- Total issue count.

Projects with no issues are also included.

## Architecture

The Dashboard module follows the existing MVC-style backend structure.

| File | Responsibility |
|---|---|
| `models/dashboardModel.js` | Executes database queries and calculates dashboard statistics |
| `controllers/dashboardController.js` | Handles requests and sends JSON responses |
| `routes/dashboardRoutes.js` | Defines dashboard API endpoints |
| `app.js` | Mounts dashboard routes and applies authentication |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/overview` | Returns dashboard summary |
| GET | `/api/dashboard/issues` | Returns issue statistics |
| GET | `/api/dashboard/projects` | Returns project-wise issue counts |

All endpoints require authentication.

## Role-Based Data Access

### Admin

The admin can access:
- Total active users.
- All projects.
- All issues.
- Global issue status and priority statistics.
- Issue counts for every project.

### Member

The member can access:
- Only their assigned projects.
- Issues belonging to their assigned projects.
- Status and priority statistics for those issues.
- Issue counts for their assigned projects.

Member-level filtering is implemented using the `project_members` table and the authenticated user's ID.

## Database and SQL Concepts

The Dashboard module uses PostgreSQL queries through the `pg` package.

Important SQL concepts used:

**1. COUNT()**

Counts users, projects, and issues.

**2. INNER JOIN**

Connects projects with project membership records to identify assigned projects.

**3. LEFT JOIN**

Includes projects and statistic categories even when they have no matching issues.

**4. GROUP BY**

Groups issues by status, priority, or project.

**5. EXISTS**

Checks whether a member belongs to the project associated with an issue.

**6. Subqueries**

Calculates multiple overview statistics in one query.

**7. UNNEST()**

Generates all predefined status and priority categories so that categories with zero issues are included in the response.

## Security

- All dashboard routes require authentication middleware.
- Dashboard data is filtered using the authenticated user's role and ID.
- Members cannot access statistics for projects they are not assigned to.
- The dashboard does not expose user password or authentication-token data.

## Testing

The Dashboard module was manually tested using Postman.

Testing covered:

- Admin overview and statistics.
- Member overview and statistics.
- Project-level data filtering.
- Members with no assigned projects.
- Zero-count issue statuses.
- Zero-count issue priorities.

All tested scenarios passed.

## Future Enhancements

- Interactive dashboard charts.
- Date-based issue reports.
- Project progress indicators.
- Recent activity and issue updates.
- Frontend dashboard integration.