# Issue Management Module

## 1. Overview

The Issue Management module is responsible for creating, tracking, updating, assigning, and deleting issues within projects in DevDesk.

It allows administrators and project members to manage development tasks and track their progress through different statuses.

Each issue belongs to a project and can optionally be assigned to an active project member.

## 2. Objectives

- Create issues within existing projects.
- View issues based on user permissions.
- Update issue details and track progress.
- Assign and reassign issues to project members.
- Validate issue data before database operations.
- Restrict issue access according to project membership.
- Allow only administrators to delete issues.

## 3. User Permissions

The module implements role-based access control.

| Operation | Admin | Project Member |
|---|---|---|
| Create issue | Any project | Assigned projects only |
| View all issues | All projects | Assigned projects only |
| View individual issue | Any issue | Issues in assigned projects |
| Update issue | Any issue | Issues in assigned projects |
| Assign/reassign issue | Eligible members of any project | Eligible members of the same project |
| Delete issue | Allowed | Not allowed |

### Project-level authorization

Members can only access issues belonging to projects in which they are registered as members.

When a member attempts to access an issue from another project, the API returns `404 Issue not found`.

## 4. Issue Status

Every issue has a status that represents its current progress.

| Status | Description |
|---|---|
| open | Issue has been created and work has not started. |
| in_progress | Someone is currently working on the issue. |
| resolved | The issue has been fixed. |
| closed | The issue is completed. |

New issues automatically receive the `open` status.

## 5. Issue Priority

Priority indicates the importance and urgency of an issue.

| Priority | Description |
|---|---|
| critical | Requires immediate attention. |
| high | Important issue requiring quick resolution. |
| medium | Normal priority issue. |
| low | Minor issue that can be handled later. |

New issues receive `medium` priority by default unless another valid priority is provided.

## 6. Issue Assignment

An issue can optionally be assigned to a project member.

The following rules apply:

- An issue can be created without an assignee.
- An assignee must be an active user.
- The assignee must have the member role.
- The assignee must belong to the same project as the issue.
- Issues can be reassigned to another eligible member.
- An existing assignment can be removed by setting `assignedTo` to `null`.

These checks prevent invalid or unauthorized issue assignments.

## 7. Issue Lifecycle

The general issue workflow is:

1. An administrator or authorized project member creates an issue.
2. The issue is associated with an existing project.
3. An eligible project member can be assigned.
4. The issue is initially marked as `open`.
5. Its status and priority can be updated.
6. The issue can move to `in_progress`, `resolved`, and `closed`.
7. An administrator can permanently delete the issue when required.

## 8. Database Design

The module uses the existing PostgreSQL `issues` table.

### Issues Table

| Column | Description |
|---|---|
| id | Primary key identifying the issue |
| title | Issue title |
| description | Detailed issue description |
| status | Current issue status |
| priority | Issue priority |
| project_id | References the associated project |
| assigned_to | References the assigned user; nullable |
| created_by | References the user who created the issue |
| created_at | Issue creation timestamp |
| updated_at | Last modification timestamp |

### Relationships

- Each issue belongs to one project.
- Each issue has one creator.
- An issue can have zero or one assigned user.
- Deleting a project cascades to its issues.
- Deleting an assigned user sets `assigned_to` to `NULL`.
- The creator relationship prevents physical deletion of a user while they are referenced by an issue. User accounts in DevDesk are soft-deleted instead.

### Database Constraints

PostgreSQL enforces:

- Valid issue status values.
- Valid priority values.
- Foreign key relationships.
- Required issue title and project association.

## 9. Backend Architecture

The module follows a layered backend architecture.

### issueModel.js

Location: `server/src/models/issueModel.js`

Responsible for database operations:

- `createIssue()` – Creates an issue using a database transaction.
- `getAllIssues()` – Retrieves issues based on the user's role.
- `getIssueById()` – Retrieves an individual issue with project-level access checks.
- `updateIssue()` – Updates issue fields and validates assignment eligibility.
- `deleteIssue()` – Permanently deletes an issue.

### issueController.js

Location: `server/src/controllers/issueController.js`

Responsible for:

- Receiving HTTP requests.
- Calling the appropriate model functions.
- Validating issue IDs.
- Handling model results.
- Returning appropriate HTTP status codes and JSON responses.

### issueRoutes.js

Location: `server/src/routes/issueRoutes.js`

Defines the Issue Management API endpoints and connects them to their controllers.

All routes require authentication through the global authentication middleware.

Issue deletion additionally requires the admin role.

### issueValidator.js

Location: `server/src/validators/issueValidator.js`

Uses Zod to validate:

- Required fields.
- Title and description lengths.
- Issue status.
- Issue priority.
- Project and assignee IDs.
- Empty update requests.
- Unsupported request fields.

## 10. Security and Data Integrity

The module includes the following protections:

- Authentication is required for all issue endpoints.
- Role-based authorization restricts issue deletion.
- Project membership controls member access.
- Assignee validation prevents assignment to unauthorized users.
- Database transactions protect issue creation and updates.
- PostgreSQL constraints protect data integrity.
- Parameterized SQL queries help prevent SQL injection.

## 11. API Integration

The Issue Management module exposes the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/issues` | Create an issue |
| GET | `/api/issues` | Retrieve accessible issues |
| GET | `/api/issues/:id` | Retrieve an individual issue |
| PATCH | `/api/issues/:id` | Update an issue |
| DELETE | `/api/issues/:id` | Delete an issue (admin only) |

For complete request and response examples, see [Issue API Documentation](../api/issue-api.md).

## 12. Testing and Verification

The module was manually tested using Postman and PostgreSQL.

The 20 planned tests covered:

- Issue creation and retrieval.
- Issue status and priority updates.
- Assignment and reassignment.
- Invalid assignee validation.
- Project-level access restrictions.
- Admin and member permissions.
- Invalid issue IDs and request bodies.
- Invalid project IDs.
- Admin-only deletion.
- Database deletion verification.

All 20 planned manual tests passed.

## 13. Summary

The Issue Management module provides the core functionality required to manage project issues in DevDesk.

It integrates authentication, role-based permissions, project membership, Zod validation, PostgreSQL transactions, and database constraints to maintain secure and reliable issue operations.

**Module Status:** Implementation and planned manual testing completed.