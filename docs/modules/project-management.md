
# Project Management Module

## 1. Module Overview

The Project Management module allows administrators to
create and manage projects and organize team members
who will work on those projects.

It provides project-level access control so members can
access only the projects assigned to them.

## 2. Main Objectives

- Create new projects.
- Retrieve all accessible projects.
- Retrieve individual project details.
- Update project information.
- Delete projects.
- Assign multiple members to projects.
- Remove members from projects.
- Protect project membership integrity.
- Restrict members to their assigned projects.

## 3. Project Creation

Purpose:

Allow administrators to create projects and assign team
members during project creation.

Workflow:

1. Administrator submits project information.
2. Backend validates the project details.
3. Backend validates selected member IDs.
4. A database transaction begins.
5. Each selected user is checked for an active member role.
6. A new project is created.
7. Project-member assignments are inserted.
8. Transaction commits.
9. Backend returns the created project.

If any selected member is invalid, the transaction is rolled
back so that neither the project nor its assignments are saved.

## 4. Multiple Member Assignment

Purpose:

Allow multiple team members to work on the same project.

DevDesk uses the project_members table to manage
project membership.

A project can contain multiple members, and a member
can belong to multiple projects.

The project_members table contains:

- id
- project_id
- user_id
- assigned_at

A unique constraint on (project_id, user_id) prevents
duplicate assignments.

## 5. View Projects

### Admin

Administrators can retrieve all projects.

### Member

Members can retrieve only projects assigned to them.

This restriction is implemented through project membership
checks in the backend.

## 6. View Individual Project

Purpose:

Retrieve project details using the project ID.

Access rules:

- Admins can view any existing project.
- Members can view only projects assigned to them.

If a member tries to access an unassigned project,
the backend returns an appropriate not-found response.

## 7. View Project Members

Purpose:

Allow users with project access to view the active
members assigned to a project.

Soft-deleted users are excluded from active-member lists.

## 8. Assign Members to Existing Projects

Purpose:

Allow administrators to assign additional members
to an existing project.

Workflow:

1. Administrator selects one or more member IDs.
2. Backend validates the project ID.
3. Database transaction begins.
4. Project row is locked.
5. Each selected user is checked for an active member role.
6. Valid assignments are inserted.
7. Duplicate assignments are ignored.
8. Transaction commits.

If any selected member is invalid, the complete transaction
is rolled back.

## 9. Remove Project Members

Purpose:

Allow administrators to remove members from projects.

Business rule:

A project must always have at least one active member.

Therefore, the backend prevents removal of the last
active member from a project.

The operation uses a database transaction to check
membership before deleting the assignment.

## 10. Project Update

Purpose:

Allow administrators to update project information.

Supported fields:

- Project name.
- Project description.

The project update timestamp is maintained automatically.

## 11. Project Deletion

Purpose:

Allow administrators to delete projects that are
no longer required.

Project deletion uses PostgreSQL foreign-key relationships.

When a project is deleted, its project_members records
are automatically removed through ON DELETE CASCADE.

## 12. User Deletion Protection

Project Management also works with User Management.

When an administrator attempts to soft-delete a user:

1. Backend identifies projects assigned to the user.
2. Affected project records are locked.
3. Active members are counted for each project.
4. Deletion is rejected if the user is the last active member.
5. Otherwise, the user account is soft-deleted.

This protects projects from being left without
an active member.

## 13. Database Relationships

The module uses:

### projects

Stores project information.

### project_members

Stores project-member assignments.

### users

Stores project owners and assigned members.

Relationships:

- projects.owner_id references users.id.
- project_members.project_id references projects.id.
- project_members.user_id references users.id.

## 14. Access Control

### Admin

- Create projects.
- View all projects.
- Update projects.
- Delete projects.
- Assign members.
- Remove members.
- View project members.

### Member

- View assigned projects.
- View accessible project details.
- View members of accessible projects.

## 15. Transaction Safety

Database transactions are used for operations involving
multiple related records.

Examples:

- Project creation with member assignments.
- Assigning multiple members.
- Removing project members.
- Soft-deleting users while protecting project membership.

Transactions help prevent partially completed operations.

## 16. Main Outcome

The Project Management module provides a structured
way to organize development teams around projects.

It ensures that administrators can manage projects,
members can access their assigned projects, and
important project membership rules are enforced
by the backend.
