
# DevDesk – Database Design

## 1. Database Overview

DevDesk uses PostgreSQL as its relational database.

The database stores application users, projects, project
memberships, issues, and revoked authentication tokens.

Relationships between tables are maintained using primary
keys and foreign keys.

## 2. Database Tables

### 2.1 Users

Purpose:

Stores registered users and their account information.

Important columns:

| Column | Description |
|---|---|
| id | Unique user identifier |
| name | User's full name |
| email | Unique email address |
| password | Hashed password |
| role | admin or member |
| is_deleted | Soft-delete status |
| created_at | Account creation timestamp |
| updated_at | Last update timestamp |

### 2.2 Projects

Purpose:

Stores projects created by administrators or other authorized
project creators.

Important columns:

| Column | Description |
|---|---|
| id | Unique project identifier |
| name | Project name |
| description | Project description |
| owner_id | User who created the project |
| created_at | Project creation timestamp |
| updated_at | Last update timestamp |

Relationship:

- owner_id references users.id.

### 2.3 Project Members

Purpose:

Connects users with projects.

A project can have multiple members, and a member can belong
to multiple projects.

Important columns:

| Column | Description |
|---|---|
| id | Unique assignment identifier |
| project_id | Related project |
| user_id | Assigned user |
| assigned_at | Assignment timestamp |

Relationships:

- project_id references projects.id.
- user_id references users.id.
- A unique constraint prevents duplicate assignments
  for the same project and user.

This table implements a many-to-many relationship.

### 2.4 Issues

Purpose:

Stores tasks, bugs, and other work items belonging to projects.

The existing issues table includes:

| Column | Description |
|---|---|
| id | Unique issue identifier |
| project_id | Related project |
| assigned_to | Assigned user |
| created_by | User who created the issue |

Additional issue fields and constraints will be documented
after inspecting and finalizing the actual Issue Management
database schema.

Relationships:

- project_id references projects.id.
- assigned_to references users.id.
- created_by references users.id.

### 2.5 Revoked Tokens

Purpose:

Stores JWT identifiers that have been revoked during logout.

Important columns:

| Column | Description |
|---|---|
| jti | Unique JWT identifier |
| user_id | Related user |
| expires_at | Token expiration time |
| revoked_at | Revocation timestamp |

Relationships:

- user_id references users.id.

## 3. Database Relationships

### Users and Projects

A user can create multiple projects through projects.owner_id.

### Users and Project Members

A user can be assigned to multiple projects through
project_members.

### Projects and Project Members

A project can contain multiple users through project_members.

### Projects and Issues

A project can contain multiple issues.

### Users and Issues

Users can create issues and can be assigned issues.

## 4. Relationship Diagram

```text
USERS
  |
  | 1-to-many (owner_id)
  |
PROJECTS
  |
  | 1-to-many
  |
PROJECT_MEMBERS
  |
  | many-to-one
  |
USERS


PROJECTS
  |
  | 1-to-many
  |
ISSUES
  |
  | assigned_to
  |
USERS

ISSUES
  |
  | created_by
  |
USERS

USERS
  |
  | 1-to-many
  |
REVOKED_TOKENS
```

## 5. Database Integrity

DevDesk uses database constraints to protect data integrity.

### Primary Keys

Every table has a primary key to uniquely identify records.

### Foreign Keys

Foreign keys maintain relationships between tables.

### Unique Constraints

Unique constraints prevent duplicate values where required.

Example:
- users.email
- project_members(project_id, user_id)

### Soft Delete

Users are soft-deleted using the is_deleted column.

This preserves user records instead of permanently removing
them from the database.

### Transactions

Transactions ensure that related database operations
succeed or fail together.

Example:
Creating a project and assigning its members is handled
within a single transaction.

## 6. Indexing

Indexes improve database query performance.

DevDesk uses indexes for frequently queried relationships,
such as:

- projects.owner_id
- issues.project_id
- issues.assigned_to
- issues.status
- revoked_tokens.expires_at

## 7. Database Design Principles

The database is designed around:

- Referential integrity.
- Data consistency.
- Relational data modeling.
- Transaction safety.
- Avoiding duplicate assignments.
- Efficient querying through indexes.

## 8. Future Database Extensions

The Issue Management module may introduce additional fields
and constraints such as:

- title
- description
- status
- priority
- due_date
- created_at
- updated_at

These will be documented after the actual schema is finalized.
