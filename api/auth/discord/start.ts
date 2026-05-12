import { randomBytes } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../../_lib/types";
import { methodNotAllowed, setNoStore } from "../../_lib/http";
import { buildDiscordAuthorizeUrl, discordStateCookie } from "../../_lib/discord";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const state = randomBytes(32).toString("base64url");
    res.setHeader("Set-Cookie", discordStateCookie(state));
    res.statusCode = 302;
    res.setHeader("Location", buildDiscordAuthorizeUrl(req, state));
    return res.end();
  } catch (error) {
    console.error("discord_start_error", error);
    return res.status(500).json({ error: "Discord OAuth nao esta configurado." });
  }
}
