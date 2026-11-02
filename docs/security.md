# DevDesk – Security Documentation

## 1. Overview

Security is an important part of the DevDesk application.

DevDesk implements multiple security mechanisms to protect user accounts, authentication sessions, API endpoints, and application data.

The backend uses JWT authentication, HTTP-only cookies, bcrypt password hashing, role-based access control, token revocation, and request validation.

---

## 2. Password Security

DevDesk uses **bcrypt** to securely hash user passwords before storing them in PostgreSQL.

### Implementation

During registration:

1. The backend receives the user's password.
2. bcrypt hashes the password using 12 salt rounds.
3. The hashed password is stored in the database.
4. The original password is never stored.

Example:

```js
const hashedPassword = await bcrypt.hash(password, 12);
```

### Password Verification

During login, bcrypt compares the submitted password with the stored hash.

```js
const isPasswordValid = await bcrypt.compare(
  password,
  user.password
);
```

### Password Security Rules

- Passwords must contain at least 8 characters.
- Passwords must not exceed 72 characters.
- Passwords are stored as bcrypt hashes.
- Passwords are never returned in API responses.
- Password changes verify the current password before updating it.

---

## 3. JWT Authentication

DevDesk uses JSON Web Tokens (JWT) to authenticate users.

After successful login, the backend generates a signed JWT.

### JWT Configuration

| Property | Value |
|---|---|
| Signing algorithm | HS256 |
| Secret | `JWT_SECRET` environment variable |
| Expiration | `JWT_EXPIRES_IN` environment variable |
| Default expiration | 1 day |
| Token identifier | Unique UUID (`jti`) |

### JWT Payload

The token contains:

```json
{
  "id": 2,
  "role": "admin"
}
```

The token also contains standard JWT claims such as `iat`, `exp`, and `jti`.

### Token Generation

```js
const token = jwt.sign(
  {
    id: user.id,
    role: user.role
  },
  process.env.JWT_SECRET,
  {
    algorithm: "HS256",
    jwtid: randomUUID(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  }
);
```

The JWT is signed by the backend and is not returned in the login response body.

---

## 4. HTTP-Only Cookie Authentication

DevDesk stores the JWT in an HTTP-only cookie instead of exposing it to frontend JavaScript.

### Cookie Configuration

| Option | Configuration | Purpose |
|---|---|---|
| `httpOnly` | `true` | Prevents JavaScript from reading the cookie |
| `secure` | Production only | Sends the cookie over HTTPS in production |
| `sameSite` | `lax` | Provides some protection against cross-site cookie requests |
| `path` | `/` | Makes the cookie available across application paths |
| `maxAge` | 24 hours | Sets the cookie lifetime |

### Cookie Creation

```js
res.cookie("token", token, cookieOptions);
```

### Benefits

- Prevents frontend JavaScript from directly reading the authentication cookie.
- Reduces exposure of the JWT to certain XSS-based token theft attacks.
- Allows browsers to automatically include the cookie in eligible requests.

The frontend must use credential-enabled requests when communicating with the backend.

For example, with Axios:

```js
axios.defaults.withCredentials = true;
```

---

## 5. Authentication Middleware

The `authenticate` middleware protects project and user management routes.

It verifies the JWT before allowing access to protected endpoints.

### Authentication Workflow

1. Read the JWT from `req.cookies.token`.
2. Check whether the cookie exists.
3. Verify the JWT signature using `JWT_SECRET`.
4. Verify that the algorithm is HS256.
5. Check whether the token contains a `jti`.
6. Check whether the token has been revoked.
7. Check whether the associated user account is active.
8. Attach the decoded JWT information to `req.user`.
9. Continue to the requested route using `next()`.

### Authentication Error Responses

| Status | Message | Meaning |
|---|---|---|
| 401 | Authentication cookie is required | No authentication cookie |
| 401 | Token has expired | JWT has expired |
| 401 | Invalid token | JWT verification failed |
| 401 | Invalid token: missing token ID | Token has no `jti` |
| 401 | Token has been revoked. Please log in again. | Token was revoked |
| 401 | Your account is inactive or has been deleted. | Account is not active |
| 503 | Authentication service temporarily unavailable | Authentication service encountered an unexpected error |

---

## 6. Token Revocation

DevDesk supports token revocation to prevent logged-out users from continuing to use an existing JWT.

### Database Table

The `revoked_tokens` table stores revoked token information.

| Column | Purpose |
|---|---|
| jti | Unique JWT identifier |
| user_id | ID of the associated user |
| expires_at | Token expiration timestamp |
| revoked_at | Time when the token was revoked |

### Logout Workflow

1. The authenticated user requests logout.
2. The backend reads the user's ID, token identifier, and expiration from the verified JWT.
3. The token identifier is inserted into `revoked_tokens`.
4. The authentication cookie is cleared.
5. The backend returns a successful logout response.

### Token Verification

For every protected request, the authentication middleware checks whether the token identifier exists in `revoked_tokens` and is still within its expiration period.

If a matching unexpired revoked token is found, access is rejected.

This prevents a logged-out token from being reused before its expiration.

---

## 7. Role-Based Access Control (RBAC)

DevDesk implements Role-Based Access Control to restrict access based on user roles.

There are two supported roles:

| Role | Description |
|---|---|
| Admin | Can manage users and projects |
| Member | Can access assigned projects and manage their own profile |

### Authorization Middleware

The `authorizeRoles` middleware checks whether the authenticated user's role is included in the list of permitted roles.

Example:

```js
router.post(
  "/",
  authorizeRoles("admin"),
  createProjectController
);
```

Only authenticated administrators can access this route.

### Authorization Responses

| Status | Meaning |
|---|---|
| 403 | User does not have the required role |

Authentication and authorization are different:

- Authentication verifies who the user is.
- Authorization determines what the user is allowed to do.

---

## 8. Security Headers with Helmet

DevDesk uses Helmet middleware to configure HTTP security headers.

Implementation:

```js
app.use(helmet());
```

Helmet helps protect the application by setting security-related HTTP headers.

These headers help reduce exposure to certain browser-based attacks and improve the security of HTTP responses.

---

## 9. CORS Configuration

DevDesk uses the `cors` middleware to control which frontend origins can communicate with the backend through browser-based cross-origin requests.

### Current Configuration

```js
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: ["Content-Type"]
  })
);
```

### Configuration Details

| Option | Purpose |
|---|---|
| `origin` | Allows requests from the configured frontend origin |
| `credentials` | Allows browser requests to include cookies |
| `methods` | Specifies permitted HTTP methods |
| `allowedHeaders` | Allows the `Content-Type` request header |

For production, the allowed origin should be updated to the deployed frontend domain.

CORS is a browser access-control mechanism; it is not a replacement for authentication or authorization.

---

## 10. Request Validation with Zod

DevDesk uses Zod to validate incoming request data before passing it to controllers.

### Registration Validation

- Name must contain at least 2 characters.
- Email must be valid.
- Email is trimmed and converted to lowercase.
- Password must contain at least 8 characters.
- Password must not exceed 72 characters.

### Login Validation

- Email must be valid.
- Email is trimmed and converted to lowercase.
- Password is required.

### User and Project Validation

The application also validates:

- User profile updates.
- User role changes.
- Password changes.
- Project creation.
- Project updates.
- Project member assignments.

### Benefits

- Prevents invalid request data from reaching business logic.
- Provides consistent validation errors.
- Helps maintain data integrity.
- Reduces unexpected errors caused by malformed input.

---

## 11. Database-Level Security and Integrity

DevDesk uses PostgreSQL constraints and transactions to maintain data integrity.

### Important Database Protections

- Unique email constraints prevent duplicate user accounts.
- Unique project-member constraints prevent duplicate assignments.
- Foreign keys maintain relationships between users, projects, and assignments.
- Transactions protect operations involving multiple database changes.
- Soft deletion preserves user records while preventing deleted accounts from accessing protected endpoints.

### Important Business Rules

- Administrators cannot delete their own accounts.
- The last active member cannot be removed from a project.
- Assigned members cannot be promoted to administrators directly.
- Deleted users cannot access protected routes.
- Invalid project-member assignments are rejected.

---

## 12. Security Middleware Order

The main application configures middleware in the following order:

1. Helmet
2. CORS
3. Express JSON parser
4. Cookie parser
5. Health check route
6. Authentication routes
7. Authentication middleware for project routes
8. Authentication middleware for user