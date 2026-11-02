# User Management API Documentation

## 1. Overview

The User Management API handles user profiles and administrative user operations in DevDesk.

It allows authenticated users to view and update their own profiles and change their passwords.

Administrators can manage user accounts, update user information, change user roles, soft-delete users, and restore deleted accounts.

### Base URL

`http://localhost:5000/api/users`

### Authentication

All User Management endpoints require authentication.

DevDesk uses JWT authentication through an HTTP-only cookie named `token`.

The authentication middleware verifies the JWT, checks whether the token has been revoked, and confirms that the user account is active.

### Authorization

| User Role | Permissions |
|---|---|
| Admin | Manage users and access personal profile operations |
| Member | Access and update their own profile and change their password |

---

## 2. Get All Users

Retrieves all registered users.

**Endpoint:** `/`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin only

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "created_at": "2026-11-01T10:00:00.000Z",
      "updated_at": "2026-11-01T10:00:00.000Z"
    },
    {
      "id": 3,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "member",
      "created_at": "2026-11-01T11:00:00.000Z",
      "updated_at": "2026-11-01T11:00:00.000Z"
    }
  ]
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Users retrieved successfully |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 500 | Failed to fetch users |

**Note:** This endpoint currently returns both active and soft-deleted users.

---

## 3. Get User by ID

Retrieves information about a specific user.

**Endpoint:** `/:id`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`GET /api/users/3`

### URL Parameters

| Parameter | Description |
|---|---|
| id | Unique ID of the user |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "member",
    "is_deleted": false,
    "created_at": "2026-11-01T11:00:00.000Z",
    "updated_at": "2026-11-01T11:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | User retrieved successfully |
| 400 | Invalid user ID |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | User not found |
| 500 | Failed to fetch user |

**Note:** The endpoint can also retrieve a soft-deleted user's record because it does not filter by `is_deleted`.

---

## 4. Update User

Allows an administrator to update another user's name, email, or role.

**Endpoint:** `/:id`

**Method:** PATCH

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`PATCH /api/users/3`

### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "member"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| name | Optional, minimum 2 and maximum 100 characters |
| email | Optional, must be a valid email address |
| role | Optional, must be `admin` or `member` |

At least one field must be provided.

Email is trimmed and converted to lowercase.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "member",
    "created_at": "2026-11-01T11:00:00.000Z",
    "updated_at": "2026-11-02T08:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | User updated successfully |
| 400 | Invalid user ID or validation failed |
| 400 | Assigned member cannot be promoted to admin |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | User not found |
| 409 | Email already exists |
| 500 | Failed to update user |

### Important Business Rule

An active member who is assigned to one or more projects cannot be changed to an admin directly.

The administrator must first remove that user's project assignments.

The update operation uses a database transaction to perform its checks and update.

---

## 5. Delete User

Soft-deletes a user account.

**Endpoint:** `/:id`

**Method:** DELETE

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`DELETE /api/users/3`

### URL Parameters

| Parameter | Description |
|---|---|
| id | ID of the user to delete |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully",
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "member",
    "is_deleted": true
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | User deleted successfully |
| 400 | Invalid user ID |
| 400 | Administrator cannot delete their own account |
| 400 | User is the last active member of a project |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | User not found or already deleted |
| 409 | User is referenced by existing records |
| 500 | Failed to delete user |

### Soft Delete Workflow

DevDesk uses soft deletion instead of permanently removing user records.

When an administrator deletes a user:

1. The user's `is_deleted` field is changed to `TRUE`.
2. The user record remains in the database.
3. Authentication middleware prevents the deleted user from accessing protected endpoints.
4. The administrator can restore the account later.

### Important Business Rule

A user cannot be deleted if they are the last active member of a project.

The deletion operation checks the affected projects inside a database transaction before updating the user's account status.

---

## 6. Restore Deleted User

Restores a previously soft-deleted user account.

**Endpoint:** `/:id/restore`

**Method:** PATCH

**Authentication:** Required

**Authorization:** Admin only

### Example Request

`PATCH /api/users/3/restore`

### URL Parameters

| Parameter | Description |
|---|---|
| id | ID of the deleted user |

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "User account restored successfully",
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "member",
    "is_deleted": false,
    "updated_at": "2026-11-02T09:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | User account restored successfully |
| 400 | Invalid user ID |
| 401 | Authentication required or invalid |
| 403 | Admin authorization required |
| 404 | User not found or account is already active |
| 500 | Failed to restore user account |

**Note:** Restoring a user changes `is_deleted` to `FALSE`. It does not automatically restore previous project assignments.

---

## 7. Get My Profile

Retrieves the profile information of the currently authenticated user.

**Endpoint:** `/profile`

**Method:** GET

**Authentication:** Required

**Authorization:** Any authenticated user

### Request Body

No request body is required.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "member",
    "created_at": "2026-11-01T11:00:00.000Z",
    "updated_at": "2026-11-01T11:00:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Profile retrieved successfully |
| 401 | Authentication required or invalid |
| 404 | User not found |
| 500 | Failed to fetch profile |

The user ID is obtained from the authenticated JWT. Users cannot provide another user's ID to retrieve their own profile.

---

## 8. Update My Profile

Allows the currently authenticated user to update their own name or email.

**Endpoint:** `/profile`

**Method:** PATCH

**Authentication:** Required

**Authorization:** Any authenticated user

### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| name | Optional, minimum 2 and maximum 100 characters |
| email | Optional, must be a valid email address |

At least one field must be provided.

Email is trimmed and converted to lowercase.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "member",
    "created_at": "2026-11-01T11:00:00.000Z",
    "updated_at": "2026-11-02T09:30:00.000Z"
  }
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Profile updated successfully |
| 400 | Request validation failed |
| 401 | Authentication required or invalid |
| 404 | User not found |
| 409 | Email already exists |
| 500 | Failed to update profile |

**Note:** Users can update their own name and email but cannot change their own role through this endpoint.

---

## 9. Change My Password

Allows the currently authenticated user to change their password.

**Endpoint:** `/change-password`

**Method:** PATCH

**Authentication:** Required

**Authorization:** Any authenticated user

### Request Body

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| currentPassword | Required |
| newPassword | Minimum 8 and maximum 72 characters |
| confirmPassword | Required and must match newPassword |

Additional rules:

- The new password must match the confirmation password.
- The new password must be different from the current password.
- The current password must be verified before updating.

### Successful Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Possible Responses

| Status | Meaning |
|---|---|
| 200 | Password changed successfully |
| 400 | Request validation failed |
| 400 | Current password is incorrect |
| 401 | Authentication required or invalid |
| 404 | User not found or unable to update password |
| 500 | Internal server error |

### Password Change Workflow

1. Retrieve the authenticated user's existing password hash.
2. Compare the supplied current password using bcrypt.
3. Verify that the new password meets validation rules.
4. Hash the new password using bcrypt with a salt-round value of 12.
5. Update the password in the database.
6. Return a success response.

Passwords are never returned in API responses.

---

## 10. Common Validation Error Response

The validation middleware uses Zod to validate incoming request bodies.

If validation fails, the API returns:

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must contain at least 2 characters"
    }
  ]
}
```

The `errors` array contains the field name and its corresponding validation message.

---

## 11. Authentication and Authorization

All User Management routes are mounted behind the authentication middleware in `app.js`.

The authentication middleware performs the following checks:

1. Reads the JWT from the HTTP-only cookie.
2. Verifies the token signature using the backend secret.
3. Checks the token identifier (`jti`).
4. Checks whether the token has been revoked.
5. Checks whether the user account is active.
6. Attaches the decoded user information to `req.user`.

After authentication, the user management router applies admin authorization to all administrative routes.

### Route Access Summary

| Endpoint | Method | Admin | Member |
|---|---|---|---|
| `/profile` | GET | Yes | Yes |
| `/profile` | PATCH | Yes | Yes |
| `/change-password` | PATCH | Yes | Yes |
| `/` | GET | Yes | No |
| `/:id` | GET | Yes | No |
| `/:id` | PATCH | Yes | No |
| `/:id` | DELETE | Yes | No |
| `/:id/restore` | PATCH | Yes | No |

---

## 12. Security and Business Rules

- All user management endpoints require authentication.
- Administrative endpoints require the `admin` role.
- Passwords are stored as bcrypt hashes.
- Passwords are never included in API responses.
- Users can update only their own profile through profile endpoints.
- Users cannot change their own role through profile updates.
- Administrators cannot delete their own accounts.
- Soft deletion preserves user records in the database.
- Deleted users cannot access protected endpoints.
- Deleted accounts can be restored by administrators.
- An active project member cannot be promoted to admin while assigned to projects.
- The last active member of a project cannot be deleted.
- Database transactions are used for sensitive user update and deletion operations.

---

## 13. Related Database Fields

The User Management API uses the `users` table.

| Column | Purpose |
|---|---|
| id | Unique user identifier |
| name | User's name |
| email | Unique email address |
| password | Bcrypt password hash |
| role | User role (`admin` or `member`) |
| is_deleted | Indicates whether the account is soft-deleted |
| created_at | Account creation timestamp |
| updated_at | Last account update timestamp |

The `is_deleted` field supports soft deletion and account restoration.

---

## 14. Summary

The User Management module provides two main categories of functionality:

**Member Profile Management**
- View own profile.
- Update own name and email.
- Change own password.

**Administrator User Management**
- Retrieve all users.
- Retrieve a user by ID.
- Update user details and roles.
- Soft-delete user accounts.
- Restore deleted accounts.

This module provides controlled user administration, account recovery, password management, and role-based access within the DevDesk Issue Tracker.
