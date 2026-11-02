
# User Management Module

## 1. Module Overview

The User Management module allows administrators to manage
registered users and allows authenticated users to manage
their own profile information.

It works together with the Authentication and RBAC modules
to ensure that user operations are secure and authorized.

## 2. Main Objectives

- View registered users.
- View individual user details.
- Update user information.
- Change user roles according to business rules.
- Soft-delete user accounts.
- Restore deleted accounts.
- Allow users to manage their own profiles.
- Allow users to change their passwords securely.

## 3. Admin User Management

### Get All Users

Purpose:
Allow administrators to retrieve registered user information.

### Get User by ID

Purpose:
Allow administrators to view the details of a specific user.

### Update User

Purpose:
Allow administrators to update user information.

Supported information:
- Name.
- Email.
- Role.

Business rule:
An assigned active project member cannot be changed
into an administrator while they still have project assignments.

### Delete User

Purpose:
Deactivate a user account without permanently deleting
the database record.

DevDesk uses soft deletion through the is_deleted column.

When an account is deleted:
- is_deleted becomes TRUE.
- The user cannot authenticate.
- The user is excluded from active project-member lists.
- Existing project assignments are retained.

Business rule:
A user cannot be deleted if doing so would leave one
of their projects without an active member.

### Restore User

Purpose:
Reactivate a previously soft-deleted account.

When an account is restored:
- is_deleted becomes FALSE.
- The account becomes eligible for authentication again.
- Previous project assignments are not automatically restored
  to active membership.

An administrator can explicitly assign the restored user
to projects again.

## 4. Member Profile Management

### Get My Profile

Purpose:
Allow authenticated users to retrieve their own profile.

### Update My Profile

Purpose:
Allow users to update their own:
- Name.
- Email.

Users cannot change their own role through this endpoint.

### Change My Password

Purpose:
Allow users to securely change their passwords.

Workflow:

1. User submits the current password.
2. Backend retrieves the stored password hash.
3. bcrypt verifies the current password.
4. Backend hashes the new password.
5. New password hash is stored in PostgreSQL.
6. Backend returns a successful response.

The new password is never stored as plain text.

## 5. Soft Delete vs Permanent Delete

### Permanent Delete

Permanently removes a database record.

This may cause loss of historical information or
complicate relationships with other records.

### Soft Delete

Marks an account as deleted without removing its record.

DevDesk uses soft deletion because it preserves user
history and supports account restoration.

## 6. Database Operations

The User Management module uses the users table.

Important columns:

- id
- name
- email
- password
- role
- is_deleted
- created_at
- updated_at

## 7. Transaction Safety

User deletion uses a database transaction.

The backend:
1. Begins a transaction.
2. Locks affected project records.
3. Checks the active-member count for each project.
4. Rejects deletion if the user is the last active member.
5. Otherwise, marks the user as deleted.
6. Commits the transaction.

This protects the project membership business rule.

## 8. Access Control

### Admin-only operations

- Get all users.
- Get a user by ID.
- Update another user's details.
- Delete another user's account.
- Restore a deleted account.

### Authenticated user operations

- View own profile.
- Update own profile.
- Change own password.

## 9. Main Outcome

The User Management module provides centralized
account administration while allowing members to manage
their personal information.

It also preserves historical records and protects
project membership rules through soft deletion and
database transactions.
