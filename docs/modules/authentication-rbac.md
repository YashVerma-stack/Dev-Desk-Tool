
# Authentication and Role-Based Access Control (RBAC)

## 1. Module Overview

The Authentication and RBAC module provides secure access
to the DevDesk application.

It verifies user identities and controls access to protected
resources according to assigned user roles.

DevDesk uses JWT-based authentication with HTTP-only cookies
and Role-Based Access Control.

## 2. Main Objectives

- Allow users to register.
- Allow registered users to log in.
- Securely store passwords.
- Authenticate users on protected API requests.
- Allow users to log out.
- Restrict operations according to user roles.
- Prevent unauthorized access.

## 3. User Registration

Purpose:

Allow new users to create an account.

Workflow:

1. User submits name, email, and password.
2. Backend validates the request.
3. Backend checks whether the email is already registered.
4. Password is hashed using bcrypt.
5. User information is stored in PostgreSQL.
6. Backend returns a successful registration response.

Security:

Passwords are never stored as plain text.

## 4. User Login

Purpose:

Verify user credentials and establish an authenticated session.

Workflow:

1. User submits email and password.
2. Backend finds the active user account.
3. bcrypt compares the submitted password with the stored hash.
4. Backend generates a signed JWT.
5. JWT is stored in an HTTP-only cookie.
6. Backend returns a successful login response.

## 5. JWT Authentication

JSON Web Token (JWT) is used to verify authenticated users.

The token contains information such as:

- User ID.
- User role.
- Token identifier (jti).
- Token expiration.

The JWT is signed using a secret key and the HS256 algorithm.

The token is not returned in the login response body.
It is stored in an HTTP-only cookie.

## 6. HTTP-only Cookies

DevDesk stores the authentication token in an HTTP-only cookie.

Important cookie settings:

- httpOnly: true
- secure: enabled in production
- sameSite: lax
- path: /
- maxAge: 24 hours

Benefits:

- JavaScript cannot directly read the HTTP-only cookie.
- The browser sends the cookie with eligible requests.
- The backend can verify the user's session.

The frontend and backend use credential-enabled CORS
configuration to support cookie-based authentication.

## 7. Authentication Middleware

Purpose:

Protect routes that require an authenticated user.

Responsibilities:

1. Read the JWT from the request cookie.
2. Verify the token signature and expiration.
3. Check whether the token has been revoked.
4. Check whether the user account is active.
5. Attach the verified user information to req.user.
6. Allow the request to continue.

If authentication fails, the request is rejected.

## 8. Logout

Purpose:

End the authenticated session.

Workflow:

1. User sends a logout request.
2. Backend identifies the current JWT.
3. The token identifier is stored in revoked_tokens.
4. Authentication cookie is cleared.
5. User receives a successful logout response.

The revoked token cannot be used again.

## 9. Password Security

DevDesk uses bcrypt for password hashing.

Benefits:

- Passwords are not stored in plain text.
- Password verification uses bcrypt comparison.
- A computationally expensive password hash makes
  offline password guessing more difficult.

## 10. Role-Based Access Control

RBAC means Role-Based Access Control.

It determines which operations a user can perform
according to their assigned role.

DevDesk currently has two roles:

### Admin

Can:
- Manage users.
- Create and manage projects.
- Assign project members.
- Access administrative operations.

### Member

Can:
- Access assigned projects.
- View their profile.
- Update their profile.
- Change their password.
- Access permitted project operations.

## 11. Authorization Middleware

The authorizeRoles middleware checks whether the
authenticated user's role is permitted to access a route.

Example:

authorizeRoles("admin")

This allows only authenticated administrators to continue.

If the user does not have the required role,
the backend returns HTTP 403 Forbidden.

## 12. Authentication vs Authorization

Authentication:
Verifies who the user is.

Authorization:
Determines what the user is allowed to do.

Example:

A member can successfully log in, but cannot access
an admin-only user-management endpoint.

## 13. Security Features

- JWT authentication.
- HTTP-only cookies.
- bcrypt password hashing.
- Role-based authorization.
- Token revocation.
- Active-account verification.
- Secure cookie configuration.
- Protected API routes.

## 14. Main Outcome

This module provides the security foundation of DevDesk.

It ensures that users must authenticate before accessing
protected resources and that application operations
are restricted according to their roles.
