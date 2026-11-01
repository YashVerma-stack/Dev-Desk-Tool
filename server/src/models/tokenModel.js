
import pool from "../config/database.js";

// Revoke a token
export const revokeToken = async (
  jti,
  userId,
  expiresAt
) => {
  const query = `
    INSERT INTO revoked_tokens (jti, user_id, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (jti) DO NOTHING
    RETURNING jti
  `;

  const result = await pool.query(query, [
    jti,
    userId,
    expiresAt,
  ]);

  return result.rows[0];
};


// Check whether token is revoked
export const isTokenRevoked = async (jti) => {
  const query = `
    SELECT jti
    FROM revoked_tokens
    WHERE jti = $1
      AND expires_at > NOW()
  `;

  const result = await pool.query(query, [jti]);

  return result.rowCount > 0;
};
