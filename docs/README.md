# DevDesk – Technical Documentation

Welcome to the technical documentation of **DevDesk**.

DevDesk is a web-based Project and Issue Management System designed to help administrators and development teams manage users, projects, team assignments, and issues from a centralized platform.

The system provides authentication, role-based access control, user management, project management, and issue tracking capabilities.

---

## 1. Documentation Structure

### 1.1 Project Information

- [Project Overview](project-overview.md)
- [System Architecture](architecture.md)
- [Database Design](database-design.md)

### 1.2 Application Modules

- [Authentication and RBAC](modules/authentication-rbac.md)
- [User Management](modules/user-management.md)
- [Project Management](modules/project-management.md)
- [Issue Management](modules/issue-management.md)
- Dashboard and Reporting — Planned

### 1.3 API Documentation

- [Authentication API](api/authentication-api.md)
- [User Management API](api/user-api.md)
- [Project Management API](api/project-api.md)
- [Issue Management API](api/issue-api.md)

### 1.4 Technical Documentation

- [Security](security.md)

---

## 2. Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JavaScript ES Modules

### Database

- PostgreSQL
- SQL
- Database transactions

### Authentication and Security

- JSON Web Tokens (JWT)
- HTTP-only Cookies
- bcrypt password hashing
- Role-Based Access Control (RBAC)
- Helmet
- CORS

### Validation and Testing

- Zod
- Vitest
- Supertest
- Postman

---

## 3. Development Progress

| Module | Status |
|---|---|
| Authentication and RBAC | Completed |
| User Management | Completed |
| Project Management | Completed |
| Issue Management | Completed |
| Dashboard and Reporting | Planned |
| Testing and Security Review | In Progress |
| Final Integration and Deployment | Planned |

---

## 4. Implemented Features

### Authentication and Authorization

- User registration and login
- JWT-based authentication using HTTP-only cookies
- User logout and token revocation
- Authentication middleware
- Role-based authorization for administrators and members

### User Management

- Retrieve all users
- Retrieve users by ID
- Update user details and roles
- Soft-delete user accounts
- Restore deleted accounts
- View and update personal profiles
- Change passwords
- Prevent deletion of the last active member of a project
- Prevent unauthorized role changes for members assigned to projects

### Project Management

- Create and manage projects
- Assign multiple members to projects
- Retrieve accessible projects
- Retrieve project details and team members
- Add and remove project members
- Prevent duplicate member assignments
- Prevent removal of the last active project member
- Validate active project members during assignment
- Use database transactions for important project operations

### Issue Management

- Create issues within projects
- Retrieve all accessible issues
- Retrieve individual issues by ID
- Update issue titles and descriptions
- Manage issue statuses:
  - Open
  - In Progress
  - Resolved
  - Closed
- Manage issue priorities:
  - Critical
  - High
  - Medium
  - Low
- Assign and reassign issues to project members
- Remove issue assignments
- Restrict issue access based on project membership
- Allow only administrators to delete issues
- Validate issue data using Zod
- Maintain data integrity using PostgreSQL constraints and transactions

---

## 5. Project Objective

The main objective of DevDesk is to provide a secure and centralized platform where administrators can manage users and projects while team members collaborate and track issues throughout their development lifecycle.

The application aims to improve team organization, task visibility, accountability, and project coordination.

---

## 6. Future Development

The next development phase will focus on Dashboard and Reporting.

Planned functionality includes:

- Admin dashboard
- Total users and project statistics
- Total issues and issue status statistics
- Priority-wise issue summaries
- Project-wise issue summaries
- Recent activities
- Dashboard data visualization

Further development will also include:

- Frontend integration for all implemented backend modules
- Final application integration
- Security and performance review
- Application deployment

---

## 7. Project Development Approach

DevDesk is being developed module by module.

Each module follows this workflow:

1. Understand the requirements and concepts.
2. Design the database structure.
3. Implement backend models and business logic.
4. Create controllers and API routes.
5. Add validation and authorization.
6. Test endpoints and important business rules.
7. Document the completed functionality.

This approach helps maintain code quality, security, consistency, and maintainability throughout development.

---

## 8. Current Project Status

The Authentication and RBAC, User Management, Project Management, and Issue Management backend modules have been implemented.

The Issue Management module passed all 20 planned manual verification tests using Postman and PostgreSQL.

The next major development phase is Dashboard and Reporting, followed by frontend integration, final testing, and deployment.