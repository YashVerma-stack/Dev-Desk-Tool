
# Authentication API Documentation

## 1. Overview

The Authentication API handles user registration, login,
logout, and authentication verification.

DevDesk uses JWT authentication with HTTP-only cookies.

Base URL:

http://localhost:5000/api/auth

---

## 2. Register User

Creates a new user account.

**Endpoint:** `/register`

**Method:** POST

**Authentication:** Not required

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| name | Minimum 2 characters |
| email | Valid email address |
| password | Minimum 8, maximum 72 characters |

Email is trimmed and converted to lowercase.

### Possible Responses

The exact success response depends on the registration
controller implementation.

| Status | Meaning |
|---|---|
| 201 | User registered successfully |
| 400 | Request validation failed |
| 409 | Email already exists |
| 500 | Internal server error |

---

## 3. Login User

Authenticates a registered user and establishes a session.

**Endpoint:** `/login`

**Method:** POST

**Authentication:** Not required

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Validation Rules

| Field | Validation |
|---|---|
| email | Valid email address |
| password | Required |

Email is trimmed and converted to lowercase.

### Successful Response

The backend verifies the credentials and sets an
HTTP-only authentication cookie.

The JWT is not returned in the response body.

The exact response body is defined by the login controller.

| Status | Meaning |
|---|---|
| 200 | Login successful |
| 400 | Request validation failed |
| 401 | Invalid credentials |
| 500 | Internal server error |

---

## 4. Logout User

Ends the currently authenticated session.

**Endpoint:** `/logout`

**Method:** POST

**Authentication:** Required

### Request Body

No request body is required.

### Workflow

1. Backend identifies the current JWT.
2. Token identifier is stored in revoked_tokens.
3. Authentication cookie is cleared.
4. Backend returns the logout response.

| Status | Meaning |
|---|---|
| 200 | Logout successful |
| 401 | Authentication required |
| 500 | Internal server error |

---

## 5. Get Current User

Returns information about the currently authenticated user.

**Endpoint:** `/me`

**Method:** GET

**Authentication:** Required

### Request Body

No request body is required.

### Successful Response

```json
{
  "success": true,
  "user": {
    "id": 2,
    "role": "admin"
  }
}
```

| Status | Meaning |
|---|---|
| 200 | User information returned |
| 401 | Authentication required |

---

## 6. Admin-Only Test Endpoint

Demonstrates role-based authorization.

**Endpoint:** `/admin`

**Method:** GET

**Authentication:** Required

**Authorization:** Admin only

### Request Body

No request body is required.

### Successful Response

```json
{
  "success": true,
  "message": "Welcome Admin! You have access to this route."
}
```

| Status | Meaning |
|---|---|
| 200 | Admin access granted |
| 401 | Authentication required |
| 403 | User does not have the required role |

---

## 7. Authentication and Cookie Handling

Login sets an HTTP-only cookie containing the JWT.

Protected requests must include the authentication cookie.

The frontend must use credential-enabled requests
to send cookies to the backend.

Logout revokes the token and clears the cookie.

---

## 8. Security Notes

- Passwords are hashed using bcrypt.
- JWT tokens are signed by the backend.
- Authentication uses HTTP-only cookies.
- Protected endpoints require authentication.
- Admin-only endpoints require the admin role.
- Revoked tokens cannot be reused.

### JWT Configuration

- Signing algorithm: HS256
- Secret key: JWT_SECRET environment variable
- Expiration: JWT_EXPIRES_IN environment variable
- Default expiration: 1 day
- Token identifier: jti (unique token ID)