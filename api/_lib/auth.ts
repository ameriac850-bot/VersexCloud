import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { ApiRequest, ApiResponse } from "./types";
import { appendSetCookie, getHeader } from "./http";
import { ensureSchema, getSql } from "./db";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_LOGIN_ATTEMPTS = 6;
const LOGIN_BLOCK_MINUTES = 15;
const BCRYPT_COST = 12;
const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-versex_session" : "versex_session";
const PASSWORD_SETUP_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-versex_password_setup" : "versex_password_setup";
const PASSWORD_SETUP_TTL_SECONDS = 60 * 15;

export type PublicUser = {
  id: string;
  email: string | null;
  name: string;
  discordUsername: string | null;
  hasPassword: boolean;
};

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validatePassword(password: unknown) {
  if (typeof password !== "string") return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,128}$/.test(password);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function passwordSetupCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PASSWORD_SETUP_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PASSWORD_SETUP_TTL_SECONDS}${secure}`;
}

export function clearPasswordSetupCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PASSWORD_SETUP_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function getSessionCookie(req: ApiRequest) {
  if (req.cookies?.[SESSION_COOKIE]) return req.cookies[SESSION_COOKIE];

  const cookie = getHeader(req, "cookie");
  const prefix = `${SESSION_COOKIE}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export function getPasswordSetupCookie(req: ApiRequest) {
  if (req.cookies?.[PASSWORD_SETUP_COOKIE]) return req.cookies[PASSWORD_SETUP_COOKIE];

  const cookie = getHeader(req, "cookie");
  const prefix = `${PASSWORD_SETUP_COOKIE}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export async function createSession(
  res: ApiResponse,
  userId: string,
  ip: string,
  userAgent: string,
) {
  const sql = getSql();
  const token = createSessionToken();
  const tokenHash = hashValue(token);
  const ipHash = hashValue(ip);
  const sessionId = randomUUID();

  await sql`
    INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_hash, expires_at)
    VALUES (
      ${sessionId},
      ${userId},
      ${tokenHash},
      ${userAgent.slice(0, 512)},
      ${ipHash},
      now() + make_interval(secs => ${SESSION_TTL_SECONDS})
    )
  `;

  appendSetCookie(res, sessionCookie(token));
}

export async function getCurrentUser(req: ApiRequest): Promise<PublicUser | null> {
  const token = getSessionCookie(req);
  if (!token) return null;

  await ensureSchema();

  const sql = getSql();
  const rows = (await sql`
    SELECT
      users.id,
      users.email,
      users.name,
      users.discord_username AS "discordUsername",
      users.password_hash IS NOT NULL AS "hasPassword"
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${hashValue(token)}
      AND sessions.revoked_at IS NULL
      AND sessions.expires_at > now()
    LIMIT 1
  `) as PublicUser[];

  return rows[0] || null;
}

export async function revokeCurrentSession(req: ApiRequest) {
  await ensureSchema();

  const token = getSessionCookie(req);
  if (!token) return;

  const sql = getSql();
  await sql`
    UPDATE sessions
    SET revoked_at = now()
    WHERE token_hash = ${hashValue(token)}
      AND revoked_at IS NULL
  `;
}

export async function createPasswordSetupToken(res: ApiResponse, userId: string) {
  const sql = getSql();
  const token = createSessionToken();
  const tokenHash = hashValue(token);
  const setupId = randomUUID();

  await sql`
    INSERT INTO password_setup_tokens (id, user_id, token_hash, expires_at)
    VALUES (
      ${setupId},
      ${userId},
      ${tokenHash},
      now() + make_interval(secs => ${PASSWORD_SETUP_TTL_SECONDS})
    )
  `;

  appendSetCookie(res, passwordSetupCookie(token));
}

export async function consumePasswordSetupToken(req: ApiRequest) {
  await ensureSchema();

  const token = getPasswordSetupCookie(req);
  if (!token) return null;

  const sql = getSql();
  const rows = (await sql`
    UPDATE password_setup_tokens
    SET used_at = now()
    WHERE token_hash = ${hashValue(token)}
      AND used_at IS NULL
      AND expires_at > now()
    RETURNING user_id AS "userId"
  `) as Array<{ userId: string }>;

  return rows[0]?.userId || null;
}

export async function isRateLimited(key: string) {
  const sql = getSql();
  const rows = (await sql`
    SELECT blocked_until
    FROM auth_rate_limits
    WHERE key = ${key}
      AND blocked_until IS NOT NULL
      AND blocked_until > now()
    LIMIT 1
  `) as Array<{ blocked_until: string }>;

  return rows.length > 0;
}

export async function recordLoginFailure(key: string) {
  const sql = getSql();
  await sql`
    INSERT INTO auth_rate_limits (key, attempts, blocked_until, updated_at)
    VALUES (${key}, 1, NULL, now())
    ON CONFLICT (key)
    DO UPDATE SET
      attempts = auth_rate_limits.attempts + 1,
      blocked_until = CASE
        WHEN auth_rate_limits.attempts + 1 >= ${MAX_LOGIN_ATTEMPTS}
          THEN now() + make_interval(mins => ${LOGIN_BLOCK_MINUTES})
        ELSE auth_rate_limits.blocked_until
      END,
      updated_at = now()
  `;
}

export async function clearLoginFailures(key: string) {
  const sql = getSql();
  await sql`
    DELETE FROM auth_rate_limits
    WHERE key = ${key}
  `;
}
