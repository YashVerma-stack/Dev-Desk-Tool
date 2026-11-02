# Project Management API Documentation

## 1. Overview

The Project Management API handles project creation, retrieval, updating, deletion, and team member assignments in DevDesk.

Administrators can create projects, assign members, update project details, manage project teams, and delete projects.

Members can view projects assigned to them and retrieve information about their project teams.

DevDesk uses PostgreSQL to store project information and project-member relationships.

### Base URL

`http://localhost:5000/api/projects`

### Authentication

All Project Management endpoints require authentication through a JWT stored in an HTTP-only cookie named `token`.

### Authorization

| User Role | Permissions |
|---|---|
| Admin | Create, view, update, and delete projects; assign and remove members |
| Member | View assigned projects and their team members |

---

## 2. Create Project

Creates a new project and assigns one or more members to it.

**Endpoint:** `/`

**Method:** POST

**Authentication:** Required

**Authorization:** Admin only

### Request Body

```json
{
  "name": "DevDesk Team Project",
  "description": "A collaborative issue tracking project",
  "memberIds": [3, 4]
}
```

### Validation Rules

| Field | Validation |
|---|---|
| name | Required, minimum 3 and maximum 150 characters |
| description | Optional, maximum 1000 characters; defaults to an empty string |
| memberIds | Required array containing at least one member ID |
| memberIds items | Must be positive integers |
| memberIds | Duplicate member IDs are not allowed |

Additional business rules:

- Every selected user must exist.
- Every selected user must have the `member` role.
- Deleted users cannot be assigned.
- At least one valid member must be assigned during project creation.

### Successful Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Project created and members assigned successfully",
  "project": {
    "id": 7,
    "name": "DevDesk Team Project",
    "description": "A collaborative issue tracking project",
    "owner_id": 2,
    "created_at": "2026-11-02T08:00:00.000Z",
    "updated_at": "2026-11-02T08:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 201 | Project created and members assigned successfully |
| 400 | Validation failed |
| 400 | At least one project member is required |
| 400 | Invalid member ID |
| 400 | Selected user is not an active member |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 500 | Failed to create project |

### Project Creation Workflow

1. Administrator submits project details and member IDs.
2. Zod validates the request body.
3. The backend verifies that each selected user is an active member.
4. A database transaction is started.
5. All selected members are validated and locked.
6. The project is inserted into the `projects` table.
7. Member assignments are inserted into `project_members`.
8. The transaction is committed.

If any selected member is invalid, the transaction is rolled back and the project is not created.

---

## 3. Get All Accessible Projects

Retrieves projects based on the authenticated user's role.

**Endpoint:** `/`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin and Member

### Request Body

No request body is required.

### Admin Behavior

Administrators can retrieve all projects.

### Member Behavior

Members can retrieve only projects assigned to them.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "projects": [
    {
      "id": 7,
      "name": "DevDesk Team Project",
      "description": "A collaborative issue tracking project",
      "owner_id": 2,
      "owner_name": "Admin User",
      "created_at": "2026-11-02T08:00:00.000Z",
      "updated_at": "2026-11-02T08:00:00.000Z"
    },
    {
      "id": 8,
      "name": "Transaction Safety Test",
      "description": "Testing project transactions",
      "owner_id": 2,
      "owner_name": "Admin User",
      "created_at": "2026-11-02T09:00:00.000Z",
      "updated_at": "2026-11-02T09:00:00.000Z"
    }
  ]
}
```

The response fields shown are illustrative; actual project records depend on the database.

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Projects retrieved successfully |
| 401 | Authentication required or invalid |
| 500 | Failed to fetch projects |

---

## 4. Get Project by ID

Retrieves information about a specific project.

**Endpoint:** `/:id`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin and assigned Members

### Example Request

`GET /api/projects/7`

### URL Parameters

| Parameter | Description |
|---|---|
| id | Unique project ID |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "project": {
    "id": 7,
    "name": "DevDesk Team Project",
    "description": "A collaborative issue tracking project",
    "owner_id": 2,
    "owner_name": "Admin User",
    "created_at": "2026-11-02T08:00:00.000Z",
    "updated_at": "2026-11-02T08:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Project retrieved successfully |
| 400 | Invalid project ID |
| 401 | Authentication required or invalid |
| 404 | Project not found or member does not have access |
| 500 | Failed to fetch project |

### Access Rules

- Administrators can retrieve any existing project.
- Members can retrieve only projects assigned to them.
- Members cannot access projects assigned to other users.

---

## 5. Update Project

Updates the name or description of an existing project.

**Endpoint:** `/:id`

**Method:** PATCH

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`PATCH /api/projects/7`

### Request Body

```json
{
  "name": "DevDesk Issue Tracker",
  "description": "Updated project description"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| name | Optional, minimum 3 and maximum 150 characters |
| description | Optional, maximum 1000 characters |

At least one field must be provided.

Both fields are trimmed before processing.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Project updated successfully",
  "project": {
    "id": 7,
    "name": "DevDesk Issue Tracker",
    "description": "Updated project description",
    "owner_id": 2,
    "created_at": "2026-11-02T08:00:00.000Z",
    "updated_at": "2026-11-02T10:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Project updated successfully |
| 400 | Invalid project ID or validation failed |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | Project not found |
| 500 | Failed to update project |

---

## 6. Delete Project

Permanently deletes a project from the database.

**Endpoint:** `/:id`

**Method:** DELETE

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`DELETE /api/projects/7`

### URL Parameters

| Parameter | Description |
|---|---|
| id | ID of the project to delete |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Project deleted successfully |
| 400 | Invalid project ID |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | Project not found |
| 500 | Failed to delete project |

### Deletion Behavior

The project is permanently removed using a SQL `DELETE` operation.

The `project_members` table has a foreign key referencing `projects` with `ON DELETE CASCADE`. Therefore, deleting a project also deletes its associated member assignments.

---

## 7. Get Project Members

Retrieves the active members assigned to a project.

**Endpoint:** `/:id/members`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin and assigned Members

### Example Request

`GET /api/projects/7/members`

### URL Parameters

| Parameter | Description |
|---|---|
| id | ID of the project |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "members": [
    {
      "id": 3,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "member",
      "assigned_at": "2026-11-02T08:30:00.000Z"
    },
    {
      "id": 4,
      "name": "John Smith",
      "email": "john@example.com",
      "role": "member",
      "assigned_at": "2026-11-02T08:35:00.000Z"
    }
  ]
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Project members retrieved successfully |
| 400 | Invalid project ID |
| 401 | Authentication required or invalid |
| 404 | Project not found or access denied |
| 500 | Failed to fetch project members |

### Access Rules

- Administrators can view members of any project.
- Members can view team members only for projects assigned to them.
- Soft-deleted users are excluded from the member list.

---

## 8. Assign Members to Existing Project

Assigns additional members to an existing project.

**Endpoint:** `/:id/members`

**Method:** POST

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`POST /api/projects/7/members`

### URL Parameters

| Parameter | Description |
|---|---|
| id | ID of the project |

### Request Body

```json
{
  "memberIds": [3, 4]
}
```

### Validation Rules

| Field | Validation |
|---|---|
| memberIds | Required array |
| memberIds | Must contain at least one ID |
| memberIds items | Must be positive integers |
| memberIds | Duplicate IDs are not allowed |

Additional business rules:

- The project must exist.
- Every selected user must be an active member.
- Administrators cannot assign deleted users or users with the admin role.
- Existing assignments are not inserted again.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Project members assigned successfully",
  "assignedCount": 2,
  "assignedMembers": [
    {
      "id": 10,
      "project_id": 7,
      "user_id": 3,
      "assigned_at": "2026-11-02T11:00:00.000Z"
    },
    {
      "id": 11,
      "project_id": 7,
      "user_id": 4,
      "assigned_at": "2026-11-02T11:00:00.000Z"
    }
  ]
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Project members assigned successfully |
| 400 | Invalid project ID or validation failed |
| 400 | Selected user is not an active member |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | Project not found |
| 500 | Failed to assign project members |

### Assignment Workflow

1. Administrator submits the project ID and member IDs.
2. Zod validates the request body.
3. The backend starts a database transaction.
4. The project row is locked using `FOR UPDATE`.
5. Each selected user is checked for existence, active status, and member role.
6. Valid assignments are inserted into `project_members`.
7. Existing assignments are skipped using `ON CONFLICT DO NOTHING`.
8. The transaction is committed.

If any selected user is invalid, the transaction is rolled back.

**Note:** `assignedCount` represents the number of new assignments created. Already assigned members are not included in `assignedMembers`.

---

## 9. Remove Member from Project

Removes a member's assignment from a project.

**Endpoint:** `/:id/members/:userId`

**Method:** DELETE

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`DELETE /api/projects/7/members/3`

### URL Parameters

| Parameter | Description |
|---|---|
| id | Project ID |
| userId | ID of the member to remove |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Member removed from project successfully",
  "assignment": {
    "id": 10,
    "project_id": 7,
    "user_id": 3,
    "assigned_at": "2026-11-02T08:30:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Member removed successfully |
| 400 | Invalid project ID or user ID |
| 400 | Cannot remove the last active member |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | Project not found |
| 404 | Member is not assigned to this project |
| 500 | Failed to remove member |

### Important Business Rule

A project must always have at least one active member.

Before removing an assignment, the backend:

1. Starts a database transaction.
2. Locks the project row.
3. Checks whether the requested member is assigned.
4. Counts the active members in the project.
5. Rejects the operation if only one active member remains.
6. Deletes the assignment and commits the transaction if removal is allowed.

---

## 10. Common Validation Error Response

The Project Management routes use Zod validation.

When a request body does not satisfy the validation schema, the API returns:

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Project name must contain at least 3 characters"
    }
  ]
}
```

The `errors` array contains the field name and validation message.

---

## 11. Authentication and Authorization

All project routes are mounted behind the authentication middleware in `app.js`.

The authentication middleware:

1. Reads the JWT from the HTTP-only cookie.
2. Verifies the JWT signature.
3. Checks the token identifier (`jti`).
4. Checks whether the token has been revoked.
5. Confirms that the user account is active.
6. Attaches the authenticated user's information to `req.user`.

The project router uses role-based authorization for administrative operations.

### Route Access Summary

| Endpoint | Method | Admin | Assigned Member |
|---|---|---|---|
| `/` | POST | Yes | No |
| `/` | GET | Yes | Yes |
| `/:id` | GET | Yes | Yes |
| `/:id` | PATCH | Yes | No |
| `/:id` | DELETE | Yes | No |
| `/:id/members` | GET | Yes | Yes |
| `/:id/members` | POST | Yes | No |
| `/:id/members/:userId` | DELETE | Yes | No |

Members can access project details and member lists only when they are assigned to the relevant project.

---

## 12. Related Database Tables

The Project Management module primarily uses two tables.

### projects

| Column | Purpose |
|---|---|
| id | Unique project identifier |
| name | Project name |
| description | Project description |
| owner_id | ID of the administrator who owns the project |
| created_at | Project creation timestamp |
| updated_at | Last project update timestamp |

### project_members

| Column | Purpose |
|---|---|
| id | Unique assignment identifier |
| project_id | Reference to the project |
| user_id | Reference to the assigned user |
| assigned_at | Assignment timestamp |

### Relationships

- One administrator can own multiple projects.
- A project can have multiple assigned members.
- A user can be assigned to multiple projects.
- The `project_members` table establishes the many-to-many relationship between projects and users.
- A unique constraint on `(project_id, user_id)` prevents duplicate assignments.
- Deleting a project cascades to its project-member assignments.
- Deleting a user cascades to their project-member assignments, according to the database foreign key.

---

## 13. Transaction Management

Database transactions are used for operations that involve multiple related database changes.

### Project Creation

Project creation and initial member assignments happen in a single transaction.

If member validation or assignment fails, the entire operation is rolled back.

### Member Assignment

The project row is locked, selected users are validated, and new assignments are inserted within one transaction.

### Member Removal

The project row is locked before checking the assignment and active member count. This helps prevent concurrent removals from leaving a project without an active member.

### User and Project Relationship

User management also checks project assignments when deleting users or changing their roles. These rules help maintain valid project membership.

---

## 14. Summary

The Project Management module provides the following functionality:

**Project Administration**
- Create projects.
- Retrieve all projects.
- Retrieve individual projects.
- Update project details.
- Delete projects.

**Team Management**
- Assign multiple members to a project.
- Retrieve project team members.
- Remove members from projects.
- Prevent duplicate assignments.
- Prevent removal of the last active project member.

**Access Control**
- Administrators can manage all projects.
- Members can view only their assigned projects.
- Administrative operations require the admin role.
- Authentication is required for every project endpoint.

This module establishes the project and team structure that the Issue Management module will use to organize and assign work.
