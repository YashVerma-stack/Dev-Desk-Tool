
# DevDesk – Project Overview

## 1. Introduction

DevDesk is a web-based Project and Issue Management System
designed to help software development teams manage users,
projects, tasks, and issues through a centralized platform.

The system provides separate access and permissions for
administrators and team members using Role-Based Access
Control (RBAC).

Administrators can manage users, create projects, assign
team members, and monitor project activities.

Team members can access their assigned projects and
collaborate by working on issues assigned to them.

## 2. Problem Statement

During software development, teams often face difficulties
in managing projects and tracking work.

Common problems include:

- Difficulty managing team members and their responsibilities.
- Lack of centralized project information.
- Unclear task ownership.
- Difficulty tracking bugs and issues.
- Lack of visibility into project progress.
- Inadequate access control for different user roles.

DevDesk aims to solve these problems by providing a
centralized project and issue management platform.

## 3. Project Objectives

The main objectives of DevDesk are:

1. Provide secure user registration and authentication.
2. Implement role-based access control.
3. Allow administrators to manage users.
4. Allow administrators to create and manage projects.
5. Support assigning multiple members to projects.
6. Allow team members to access their assigned projects.
7. Provide issue creation, assignment, and tracking.
8. Track issue status and priority.
9. Provide project and issue statistics through a dashboard.

## 4. User Roles

### Administrator

The administrator manages the overall application.

Responsibilities:

- Manage registered users.
- Update user details and roles.
- Restore soft-deleted accounts.
- Create, update, and delete projects.
- Assign and remove project members.
- Manage project issues.
- View overall project information.

### Team Member

A team member works on projects assigned to them.

Responsibilities:

- Access assigned projects.
- View project details.
- View project issues.
- Work on assigned issues.
- Update issue progress according to permissions.
- Manage their own profile.

## 5. Main Application Modules

### Module 1: Authentication and RBAC

Purpose:
Secure the application and ensure that only authenticated
users can access protected resources.

Features:

- User registration.
- User login and logout.
- JWT-based authentication.
- HTTP-only cookie authentication.
- Password hashing using bcrypt.
- Role-based authorization.
- Admin and member roles.

### Module 2: User Management

Purpose:
Allow administrators to manage application users and
allow users to manage their own profiles.

Features:

- List all users.
- View individual user details.
- Update user information.
- Soft-delete user accounts.
- Restore deleted accounts.
- View and update personal profiles.
- Change passwords.

### Module 3: Project Management

Purpose:
Provide a centralized way to create projects and organize
team members who will work on them.

Features:

- Create projects.
- View all projects.
- View individual project details.
- Update project information.
- Delete projects.
- Assign multiple members to projects.
- Remove members from projects.
- Restrict members to their assigned projects.
- Prevent removal or deletion of the last active member.

### Module 4: Issue Management

Purpose:
Allow team members to report, manage, assign, and track
work items and problems within projects.

Planned features:

- Create issues within projects.
- Assign issues to team members.
- Set issue priorities.
- Manage issue statuses.
- Update issue details.
- Delete issues according to permissions.
- Track issue progress.
- View issues belonging to accessible projects.

### Module 5: Dashboard and Reporting

Purpose:
Provide an overview of application activity and project
progress.

Planned features:

- Total registered users.
- Total projects.
- Total issues.
- Open and completed issues.
- Issues grouped by status.
- Issues grouped by priority.
- Project progress statistics.

## 6. Technology Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js
- JavaScript ES Modules

### Database
- PostgreSQL

### Authentication and Security
- JSON Web Tokens (JWT)
- HTTP-only Cookies
- bcrypt
- Role-Based Access Control
- Helmet
- CORS
- Express Rate Limit

### Validation and Testing
- Zod
- Vitest
- Supertest

## 7. High-Level Project Workflow

1. A user registers or logs into DevDesk.
2. The backend authenticates the user.
3. The user's role determines which operations are allowed.
4. Administrators manage users and create projects.
5. Administrators assign team members to projects.
6. Members access their assigned projects.
7. Issues are created and assigned within projects.
8. Team members work on issues and update their progress.
9. The dashboard displays project and issue statistics.

## 8. Expected Outcome

DevDesk aims to provide a secure, organized, and scalable
platform for managing software development projects.

It brings user management, project organization, and issue
tracking together in one application, improving team
collaboration, work visibility, and accountability.

## 9. Future Enhancements

Possible future enhancements include:

- Email notifications.
- Issue comments and discussion.
- File attachments.
- Advanced project analytics.
- Activity history and audit logs.
- Real-time notifications.
