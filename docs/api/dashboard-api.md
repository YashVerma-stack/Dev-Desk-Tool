# Dashboard API Documentation

## Overview

The Dashboard API provides summary information and statistics for the DevDesk Issue Tracker.

It supports both Admin and Member roles. The data returned depends on the authenticated user's role and project assignments.

**Base URL:** `/api/dashboard`

**Authentication:** Required for all endpoints. Cookie-based JWT authentication is used.

---

## 1. Get Dashboard Overview

**Endpoint:** `GET /api/dashboard/overview`

**Description:** Returns summary counts for the dashboard.

### Admin response

```json
{
  "success": true,
  "overview": {
    "total_users": "6",
    "total_projects": "7",
    "total_issues": "2"
  }
}
```

Admin receives:
- Total active users.
- Total projects.
- Total issues.

### Member response

```json
{
  "success": true,
  "overview": {
    "total_projects": "2",
    "total_issues": "2"
  }
}
```

Member receives:
- Number of assigned projects.
- Number of issues belonging to assigned projects.

---

## 2. Get Dashboard Issue Statistics

**Endpoint:** `GET /api/dashboard/issues`

**Description:** Returns issue statistics grouped by status and priority.

### Response

```json
{
  "success": true,
  "issueStats": {
    "statusStats": [
      { "status": "open", "total": "1" },
      { "status": "in_progress", "total": "0" },
      { "status": "resolved", "total": "1" },
      { "status": "closed", "total": "0" }
    ],
    "priorityStats": [
      { "priority": "critical", "total": "0" },
      { "priority": "high", "total": "1" },
      { "priority": "medium", "total": "0" },
      { "priority": "low", "total": "1" }
    ]
  }
}
```

**Issue statuses:**
- `open`
- `in_progress`
- `resolved`
- `closed`

**Issue priorities:**
- `critical`
- `high`
- `medium`
- `low`

All four categories are returned, including categories with zero issues.

Admin receives statistics for all issues. Members receive statistics only for issues belonging to their assigned projects.

---

## 3. Get Dashboard Project Statistics

**Endpoint:** `GET /api/dashboard/projects`

**Description:** Returns project-wise issue counts.

### Response

```json
{
  "success": true,
  "projectStats": [
    {
      "project_id": 7,
      "project_name": "DevDesk Team Project",
      "total_issues": "2"
    },
    {
      "project_id": 6,
      "project_name": "Job Application Portal",
      "total_issues": "0"
    }
  ]
}
```

Admin receives statistics for all projects.

Members receive statistics only for their assigned projects.

Projects with zero issues are also included.

---

## Authentication and Authorization

All dashboard endpoints require a valid authentication cookie.

| Feature | Admin | Member |
|---|---|---|
| View total users | Yes | No |
| View all projects | Yes | No |
| View assigned projects | Yes | Yes |
| View all issues | Yes | No |
| View issues in assigned projects | Yes | Yes |
| View issue status statistics | All issues | Assigned projects |
| View priority statistics | All issues | Assigned projects |

## Error Responses

### 401 Unauthorized

Returned when the user is not authenticated or the authentication token is invalid.

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

Returned when an unexpected server-side error occurs.

Example:

```json
{
  "success": false,
  "message": "Failed to fetch dashboard overview"
}
```

The error message depends on the endpoint.

---

## Testing

The Dashboard APIs were manually tested using Postman.

Test coverage included:
- Admin dashboard overview.
- Admin issue statistics.
- Admin project statistics.
- Member dashboard overview.
- Member issue statistics.
- Member project statistics.
- Member access restrictions for unassigned projects.
- Zero-count status and priority categories.

All tested scenarios passed.