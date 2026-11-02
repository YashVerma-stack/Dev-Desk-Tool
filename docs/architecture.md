
# DevDesk – System Architecture

## 1. Architecture Overview

DevDesk follows a client-server architecture.

The frontend communicates with the backend through REST APIs.
The backend handles authentication, authorization, validation,
business logic, and database operations.

PostgreSQL is used to store application data.

## 2. Technology Architecture

### Frontend Layer
- React
- Vite
- JavaScript
- API integration

Responsibilities:
- Display application pages and dashboards.
- Collect user input.
- Send HTTP requests to backend APIs.
- Display API responses and errors.

### Backend Layer
- Node.js
- Express.js

Responsibilities:
- Expose REST API endpoints.
- Authenticate users.
- Authorize user operations.
- Validate incoming requests.
- Execute business logic.
- Communicate with PostgreSQL.

### Database Layer
- PostgreSQL

Responsibilities:
- Store user information.
- Store project information.
- Store project memberships.
- Store issue information.
- Store revoked authentication tokens.

## 3. Backend Architecture

The backend follows a modular layered structure.

### Routes

Routes define API endpoints and connect them to controllers.

Example:
- authRoutes.js
- userRoutes.js
- projectRoutes.js

### Middleware

Middleware executes before the controller.

Examples:
- Authentication middleware.
- Role authorization middleware.
- Request validation middleware.
- Security middleware.

### Controllers

Controllers receive requests and prepare HTTP responses.

Responsibilities:
- Read request parameters and body.
- Call model functions.
- Handle success and error responses.
- Return appropriate HTTP status codes.

### Models

Models contain database operations and business logic.

Responsibilities:
- Execute SQL queries.
- Insert and retrieve records.
- Update and delete records.
- Manage database transactions.
- Enforce important business rules.

### Config

Contains application configuration.

Examples:
- Database connection.
- Database schema.

### Validators

Contain Zod schemas used to validate incoming request data.

### Utils

Contain reusable helper functions.

Example:
- Cookie configuration.

## 4. Request-Response Flow

The typical backend request flow is:

1. Client sends an HTTP request.
2. Express receives the request.
3. Authentication middleware verifies the session.
4. Authorization middleware checks permissions when required.
5. Validation middleware checks request data when configured.
6. Controller processes the request.
7. Model performs database operations.
8. PostgreSQL returns the result.
9. Controller sends an HTTP response.
10. Client displays the result.

## 5. Example: Create Project Flow

When an administrator creates a project:

1. React sends POST /api/projects.
2. Express receives the request.
3. Authentication middleware checks the HTTP-only JWT cookie.
4. Authorization middleware verifies the admin role.
5. Zod validates project data and member IDs.
6. Project controller calls the project model.
7. The model starts a PostgreSQL transaction.
8. Selected members are checked inside the transaction.
9. The project and member assignments are inserted.
10. The transaction commits.
11. The controller returns HTTP 201 Created.

If an invalid member is selected, the transaction is rolled back.

## 6. Authentication Architecture

DevDesk uses JWT-based authentication with HTTP-only cookies.

Login flow:

1. User submits email and password.
2. Backend finds the active user.
3. bcrypt compares the submitted password with the stored hash.
4. Backend creates a signed JWT.
5. JWT is stored in an HTTP-only cookie.
6. Browser sends the cookie with subsequent requests.
7. Authentication middleware verifies the token.
8. The user identity and role become available through req.user.

Logout flow:

1. User sends a logout request.
2. Backend identifies the current JWT.
3. Its token ID is recorded in revoked_tokens.
4. Authentication cookie is cleared.

## 7. Authorization Architecture

DevDesk uses Role-Based Access Control (RBAC).

### Admin
- Manage users.
- Create and manage projects.
- Assign project members.
- Access administrative operations.

### Member
- Access assigned projects.
- View their own profile.
- Work with permitted project issues.

Authentication answers:
"Who is the user?"

Authorization answers:
"What is this user allowed to do?"

## 8. Database Communication

The backend uses the PostgreSQL connection pool.

Models execute parameterized SQL queries to prevent SQL injection.

Database transactions are used when multiple operations must
succeed or fail together.

Example:
Project creation and member assignment are handled in
one transaction.

## 9. Security Architecture

The backend uses:

- bcrypt for password hashing.
- JWT for authentication.
- HTTP-only cookies for token storage.
- RBAC for access control.
- Helmet for HTTP security headers.
- CORS for cross-origin access control.
- Express Rate Limit for request limiting.
- Zod for request validation.
- Parameterized SQL queries for database operations.

## 10. High-Level Architecture Diagram

```text
              CLIENT
           React + Vite
                 |
                 | HTTP Requests
                 v
          EXPRESS SERVER
                 |
          Authentication
             Middleware
                 |
          Authorization
             Middleware
                 |
          Validation Middleware
                 |
             Controllers
                 |
               Models
                 |
          PostgreSQL Pool
                 |
            PostgreSQL
                 |
          HTTP Response
                 |
                 v
          React Frontend
```

## 11. Future Architecture Extensions

Possible future extensions:

- Email notification service.
- File upload service.
- Real-time notifications.
- Audit logging.
- Advanced reporting.
