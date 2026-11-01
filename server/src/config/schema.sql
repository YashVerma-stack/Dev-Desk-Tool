
-- =====================================
-- 1. USERS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================
-- 2. PROJECTS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,

    owner_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =====================================
-- 3. ISSUES TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'in_progress',
                'resolved',
                'closed'
            )
        ),

    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (
            priority IN (
                'low',
                'medium',
                'high',
                'critical'
            )
        ),

    project_id INTEGER NOT NULL,
    assigned_to INTEGER,
    created_by INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_issue_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_issue_assigned_user
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_issue_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


-- =====================================
-- 4. DATABASE INDEXES
-- =====================================

CREATE INDEX IF NOT EXISTS idx_projects_owner
ON projects(owner_id);

CREATE INDEX IF NOT EXISTS idx_issues_project
ON issues(project_id);

CREATE INDEX IF NOT EXISTS idx_issues_assigned
ON issues(assigned_to);

CREATE INDEX IF NOT EXISTS idx_issues_status
ON issues(status);


-- =====================================
-- 4. REVOKED TOKENS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti UUID PRIMARY KEY,

    user_id INTEGER NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_revoked_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index for token expiration cleanup
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expiry
ON revoked_tokens(expires_at);
