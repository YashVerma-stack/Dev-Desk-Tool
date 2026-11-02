# DevDesk – Technical Documentation

Welcome to the technical documentation of **DevDesk**.

DevDesk is a web-based Project and Issue Management System designed to help administrators and development teams manage users, projects, team assignments, and issues from a centralized platform.

The system provides authentication, role-based access control, user management, project management, issue tracking, and dashboard reporting capabilities.

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
- [Dashboard and Reporting](modules/dashboard.md)

### 1.3 API Documentation

- [Authentication API](api/authentication-api.md)
- [User Management API](api/user-api.md)
- [Project Management API](api/project-api.md)
- [Issue Management API](api/issue-api.md)
- [Dashboard API](api/dashboard-api.md)

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
| Dashboard and Reporting Backend | Completed |
| Backend API Testing | Completed |
| Technical and API Documentation | Completed |
| Frontend Integration | Planned |
| Final Testing and Security Review | Planned |
| Deployment | Planned |

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

### Dashboard and Reporting

- Admin dashboard overview with active user, project, and issue counts
- Member dashboard overview with assigned project and issue counts
- Issue statistics grouped by status
- Issue statistics grouped by priority
- Project-wise issue statistics
- Admin access to global dashboard statistics
- Member access restricted to assigned projects
- Include projects with zero issues in project statistics
- Return all status and priority categories, including zero counts
- Use PostgreSQL aggregation queries for dashboard reporting

---

## 5. Project Objective

The main objective of DevDesk is to provide a secure and centralized platform where administrators can manage users and projects while team members collaborate and track issues throughout their development lifecycle.

The application aims to improve team organization, task visibility, accountability, and project coordination.

---

## 6. Future Development

The next development phase will focus on frontend integration and final application completion.

Planned functionality includes:

- Admin dashboard UI
- Member dashboard UI
- Interactive issue status and priority charts
- Project-wise issue visualization
- Recent activities
- Frontend integration for authentication, user management, project management, and issue management
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

The Authentication and RBAC, User Management, Project Management, Issue Management, and Dashboard and Reporting backend modules have been implemented.

The Issue Management module passed all 20 planned manual verification tests using Postman and PostgreSQL.

The Dashboard backend APIs have also been tested for both admin and member roles, including project-level access restrictions and zero-count status and priority statistics.

Technical and API documentation has been completed for all implemented modules.

The next major development phase is frontend integration, followed by final application testing, security review, and deployment.