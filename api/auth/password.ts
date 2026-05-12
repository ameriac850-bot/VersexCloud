import type { ApiRequest, ApiResponse } from "../_lib/types";
import { badRequest, getClientIp, getHeader, methodNotAllowed, readJsonBody, setNoStore } from "../_lib/http";
import {
  clearPasswordSetupCookie,
  consumePasswordSetupToken,
  createSession,
  hashPassword,
  validatePassword,
} from "../_lib/auth";
import { getSql } from "../_lib/db";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readJsonBody(req);
    const password = typeof body.password === "string" ? body.password : "";

    if (!validatePassword(password)) {
      return badRequest(res, "A senha precisa ter 10 a 128 caracteres, com maiuscula, minuscula e numero.");
    }

    const userId = await consumePasswordSetupToken(req);
    if (!userId) {
      res.setHeader("Set-Cookie", clearPasswordSetupCookie());
      return res.status(401).json({ error: "A verificacao do Discord expirou. Entre com Discord novamente." });
    }

    const sql = getSql();
    const passwordHash = await hashPassword(password);
    const rows = (await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = now()
      WHERE id = ${userId}
      RETURNING id, email, name, discord_username AS "discordUsername", password_hash IS NOT NULL AS "hasPassword"
    `) as Array<{
      id: string;
      email: string | null;
      name: string;
      discordUsername: string | null;
      hasPassword: boolean;
    }>;

    const user = rows[0];
    await createSession(res, user.id, getClientIp(req), getHeader(req, "user-agent"));

    const sessionHeader = res.getHeader("Set-Cookie");
    const cookies = [clearPasswordSetupCookie()];
    if (Array.isArray(sessionHeader)) {
      cookies.push(...sessionHeader.map(String));
    } else if (sessionHeader) {
      cookies.push(String(sessionHeader));
    }
    res.setHeader("Set-Cookie", cookies);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("password_setup_error", error);
    return res.status(500).json({ error: "Nao foi possivel salvar a senha agora." });
  }
}
