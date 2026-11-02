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
- [Issue Management](modules/issue-management.md) — Upcoming
- [Dashboard and Reporting](modules/dashboard.md) — Planned

### 1.3 API Documentation

- [Authentication API](api/authentication-api.md)
- [User Management API](api/user-api.md)
- [Project Management API](api/project-api.md)
- [Issue Management API](api/issue-api.md) — Upcoming

### 1.4 Technical Documentation

- [Security](security.md)
- [Testing Strategy](testing.md)

---

## 2. Technology Stack

### Frontend

- React
- Vite
- JavaScript

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

---

## 3. Development Progress

| Module | Status |
|---|---|
| Authentication and RBAC | Completed |
| User Management | Completed |
| Project Management | Completed |
| Issue Management | Upcoming |
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

### Project Management

- Create and manage projects
- Assign multiple members to projects
- Retrieve accessible projects
- Retrieve project details and team members
- Add and remove project members
- Prevent duplicate member assignments
- Prevent removal of the last active project member
- Use database transactions for important project operations

---

## 5. Project Objective

The main objective of DevDesk is to provide a secure and centralized platform where administrators can manage users and projects while team members collaborate and track issues throughout their development lifecycle.

The application aims to improve team organization, task visibility, accountability, and project coordination.

---

## 6. Future Development

The next development phase will focus on Issue Management.

Planned functionality includes:

- Issue creation and tracking
- Issue assignment to project members
- Issue status management
- Issue priority management
- Issue updates and comments
- Issue filtering and searching

Dashboard and reporting functionality will be developed after the core issue management workflow is implemented.

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
