import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReady: Promise<void> | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export async function ensureSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text UNIQUE,
        name text NOT NULL,
        password_hash text,
        discord_id text,
        discord_username text,
        discord_avatar text,
        terms_accepted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id text`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_username text`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_avatar text`;
    await sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`;
    await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_unique_full_idx
      ON users (discord_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS users_discord_username_lower_idx
      ON users (lower(discord_username))
      WHERE discord_username IS NOT NULL
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        user_agent text,
        ip_hash text,
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS sessions_user_id_idx
      ON sessions (user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS sessions_active_token_idx
      ON sessions (token_hash, expires_at)
      WHERE revoked_at IS NULL
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_rate_limits (
        key text PRIMARY KEY,
        attempts integer NOT NULL DEFAULT 0,
        blocked_until timestamptz,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS password_setup_tokens (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL,
        used_at timestamptz
      )
    `;
  })();

  return schemaReady;
}
