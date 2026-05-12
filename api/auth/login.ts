import type { ApiRequest, ApiResponse } from "../_lib/types";
import { badRequest, getClientIp, getHeader, methodNotAllowed, readJsonBody, sendJson, setNoStore } from "../_lib/http";
import {
  clearLoginFailures,
  createSession,
  hashValue,
  isRateLimited,
  recordLoginFailure,
  verifyPassword,
} from "../_lib/auth";
import { ensureSchema, getSql } from "../_lib/db";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    await ensureSchema();

    const body = await readJsonBody(req);
    const identifier = typeof body.identifier === "string" ? body.identifier.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return badRequest(res, "Informe usuario Discord e senha.");
    }

    const ip = getClientIp(req);
    const rateKey = hashValue(`${ip}:${identifier}`);

    if (await isRateLimited(rateKey)) {
      return sendJson(res, 429, { error: "Muitas tentativas. Tente novamente em alguns minutos." });
    }

    const sql = getSql();
    const rows = (await sql`
      SELECT
        id,
        email,
        name,
        discord_username AS "discordUsername",
        password_hash,
        password_hash IS NOT NULL AS "hasPassword"
      FROM users
      WHERE lower(discord_username) = ${identifier}
      LIMIT 1
    `) as Array<{
      id: string;
      email: string | null;
      name: string;
      discordUsername: string | null;
      password_hash: string | null;
      hasPassword: boolean;
    }>;

    const user = rows[0];

    if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
      await recordLoginFailure(rateKey);
      return sendJson(res, 401, { error: "Usuario Discord ou senha incorretos." });
    }

    await clearLoginFailures(rateKey);
    await createSession(res, user.id, ip, getHeader(req, "user-agent"));

    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        discordUsername: user.discordUsername,
        hasPassword: user.hasPassword,
      },
    });
  } catch (error) {
    console.error("login_error", error);
    return sendJson(res, 500, { error: "Nao foi possivel entrar agora." });
  }
}
