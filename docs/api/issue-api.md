# Issue Management API Documentation

## 1. Overview

The Issue Management API allows administrators and project members to create, view, update, assign, reassign, and manage project issues.

All endpoints require authentication through the HTTP-only JWT cookie.

**Base URL:** `http://localhost:5000/api/issues`

## 2. Authorization Rules

| Operation | Admin | Project Member |
|---|---|---|
| Create issue | Any project | Assigned projects only |
| View all issues | All projects | Assigned projects only |
| View issue by ID | Any issue | Issues in assigned projects |
| Update issue | Any issue | Issues in assigned projects |
| Assign/reassign issue | Any eligible project member | Any eligible member of the same project |
| Delete issue | Allowed | Not allowed |

**Important:** A new assignee must be an active member of the issue's project.

## 3. Create Issue

**Endpoint:** `POST /api/issues`

Creates a new issue in a project.

**Request body:**

```json
{
  "title": "Login page not working",
  "description": "Users are unable to log in using valid credentials.",
  "priority": "high",
  "projectId": 7,
  "assignedTo": 3
}
```

| Field | Required | Description |
|---|---|---|
| title | Yes | Issue title, 3–200 characters |
| description | No | Issue description, maximum 5000 characters |
| priority | No | critical, high, medium, low; defaults to medium |
| projectId | Yes | Positive integer identifying the project |
| assignedTo | No | Positive user ID or null |

**Success:** `201 Created`

```json
{
  "success": true,
  "message": "Issue created successfully",
  "issue": {
    "id": 1,
    "title": "Login page not working",
    "description": "Users are unable to log in using valid credentials.",
    "status": "open",
    "priority": "high",
    "project_id": 7,
    "assigned_to": 3,
    "created_by": 2,
    "created_at": "2026-11-02T08:55:39.217Z",
    "updated_at": "2026-11-02T08:55:39.217Z"
  }
}
```

**Possible errors:**
- `400 Bad Request` – Invalid assignee or validation failure.
- `403 Forbidden` – Member is not assigned to the project.
- `404 Not Found` – Project does not exist.
- `500 Internal Server Error` – Unexpected server error.

## 4. Get All Issues

**Endpoint:** `GET /api/issues`

Retrieves issues according to the authenticated user's role.

- Admin receives issues from all projects.
- Members receive issues only from their assigned projects.

**Success:** `200 OK`

```json
{
  "success": true,
  "count": 1,
  "issues": [
    {
      "id": 1,
      "title": "Login page not working",
      "description": "Users are unable to log in using valid credentials.",
      "status": "open",
      "priority": "high",
      "project_id": 7,
      "assigned_to": 3,
      "created_by": 2,
      "project_name": "DevDesk Team Project",
      "creator_name": "test1",
      "assignee_name": "test2"
    }
  ]
}
```

## 5. Get Issue by ID

**Endpoint:** `GET /api/issues/:id`

Retrieves an individual issue by its ID.

**Example:**

`GET /api/issues/1`

**Success:** `200 OK`

```json
{
  "success": true,
  "issue": {
    "id": 1,
    "title": "Login page not working",
    "status": "open",
    "priority": "high",
    "project_id": 7,
    "assigned_to": 3,
    "created_by": 2,
    "project_name": "DevDesk Team Project",
    "creator_name": "test1",
    "assignee_name": "test2"
  }
}
```

**Possible errors:**
- `400 Bad Request` – Invalid issue ID.
- `404 Not Found` – Issue does not exist or is inaccessible to the member.
- `500 Internal Server Error` – Unexpected server error.

## 6. Update Issue

**Endpoint:** `PATCH /api/issues/:id`

Updates one or more fields of an existing issue.

**Example request:**

```json
{
  "title": "Login functionality issue",
  "description": "Login fails for valid users.",
  "status": "in_progress",
  "priority": "critical",
  "assignedTo": 4
}
```

All fields are optional, but at least one valid field must be supplied.

**Allowed status values:**

| Value | Description |
|---|---|
| open | Newly created issue |
| in_progress | Work is ongoing |
| resolved | Issue has been fixed |
| closed | Issue is completed |

**Allowed priority values:**

| Value | Description |
|---|---|
| critical | Requires immediate attention |
| high | High importance |
| medium | Normal importance |
| low | Low importance |

To remove an assignee, send:

```json
{
  "assignedTo": null
}
```

**Success:** `200 OK`

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "issue": {
    "id": 1,
    "title": "Login functionality issue",
    "status": "in_progress",
    "priority": "critical",
    "project_id": 7,
    "assigned_to": 4
  }
}
```

**Possible errors:**
- `400 Bad Request` – Invalid fields, invalid assignee, or empty update body.
- `403 Forbidden` – Member cannot access the project's issue.
- `404 Not Found` – Issue does not exist.
- `500 Internal Server Error` – Unexpected server error.

## 7. Delete Issue

**Endpoint:** `DELETE /api/issues/:id`

Permanently deletes an issue from the database.

**Permission:** Admin only.

**Success:** `200 OK`

```json
{
  "success": true,
  "message": "Issue deleted successfully",
  "issue": {
    "id": 1,
    "title": "Login page not working",
    "status": "open",
    "priority": "high",
    "project_id": 7
  }
}
```

**Possible errors:**
- `403 Forbidden` – Member attempts to delete an issue.
- `404 Not Found` – Issue does not exist.
- `500 Internal Server Error` – Unexpected server error.

## 8. Validation Rules

The API uses Zod to validate incoming request bodies.

### Create issue validation

- Title is required and must contain 3–200 characters.
- Description is optional and limited to 5000 characters.
- Project ID must be a positive integer.
- Priority must be one of the four allowed values.
- Assignee must be a positive integer or null.
- Unknown fields are rejected.

### Update issue validation

- At least one field is required.
- Only title, description, status, priority, and assignedTo are accepted.
- Status and priority must match their allowed values.
- Unknown fields are rejected.

## 9. Security and Database Rules

- All issue routes require authentication.
- Project-level access is enforced for members.
- Only admins can delete issues.
- Assignees must be active members of the same project.
- PostgreSQL foreign keys maintain relationships between issues, projects, and users.
- Database transactions protect issue creation and updates.
- PostgreSQL constraints enforce valid status and priority values.

## 10. Testing

The Issue Management endpoints were manually verified using Postman and PostgreSQL.

Tests covered:
- Issue creation and retrieval.
- Role-based access control.
- Project-level authorization.
- Status and priority updates.
- Issue assignment and reassignment.
- Invalid assignee and project validation.
- Invalid issue IDs and request bodies.
- Admin-only deletion.
- Database deletion verification.

All 20 planned manual tests passed.

---

**Module:** DevDesk Issue Management  
**API Base URL:** `http://localhost:5000/api/issues`  
**Authentication:** HTTP-only JWT cookie  
**Validation:** Zod  
**Database:** PostgreSQL