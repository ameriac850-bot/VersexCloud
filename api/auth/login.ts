import type { ApiRequest, ApiResponse } from "../_lib/types";
import { badRequest, getClientIp, getHeader, methodNotAllowed, readJsonBody, setNoStore } from "../_lib/http";
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
      return res.status(429).json({ error: "Muitas tentativas. Tente novamente em alguns minutos." });
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
      return res.status(401).json({ error: "Usuario Discord ou senha incorretos." });
    }

    await clearLoginFailures(rateKey);
    await createSession(res, user.id, ip, getHeader(req, "user-agent"));

    return res.status(200).json({
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
    return res.status(500).json({ error: "Nao foi possivel entrar agora." });
  }
}
