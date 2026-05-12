import { randomUUID } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../../_lib/types";
import { appendSetCookie, getClientIp, getHeader, setNoStore } from "../../_lib/http";
import {
  clearDiscordStateCookie,
  exchangeDiscordCode,
  getDiscordConfig,
  getDiscordStateCookie,
  getDiscordUser,
  getOrigin,
  isDiscordGuildMember,
} from "../../_lib/discord";
import { createPasswordSetupToken, createSession } from "../../_lib/auth";
import { ensureSchema, getSql } from "../../_lib/db";

function redirect(res: ApiResponse, location: string) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  return res.end();
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "GET") {
    return redirect(res, "/?auth=discord-error");
  }

  try {
    const url = new URL(req.url || "", getOrigin(req));
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const savedState = getDiscordStateCookie(req);

    appendSetCookie(res, clearDiscordStateCookie());

    if (!code || !state || !savedState || state !== savedState) {
      return redirect(res, "/?auth=discord-error");
    }

    await ensureSchema();

    const token = await exchangeDiscordCode(req, code);
    const discordUser = await getDiscordUser(token.access_token);
    const { guildId } = getDiscordConfig(req);
    const isMember = await isDiscordGuildMember(token.access_token, guildId);

    if (!isMember) {
      return redirect(res, "/?auth=not-in-guild");
    }

    const sql = getSql();
    const displayName = discordUser.global_name || discordUser.username;
    const rows = (await sql`
      INSERT INTO users (id, name, discord_id, discord_username, discord_avatar, terms_accepted_at)
      VALUES (${randomUUID()}, ${displayName}, ${discordUser.id}, ${discordUser.username}, ${discordUser.avatar || null}, now())
      ON CONFLICT (discord_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        discord_username = EXCLUDED.discord_username,
        discord_avatar = EXCLUDED.discord_avatar,
        updated_at = now()
      RETURNING id, email, name, discord_username AS "discordUsername", password_hash IS NOT NULL AS "hasPassword"
    `) as Array<{
      id: string;
      email: string | null;
      name: string;
      discordUsername: string | null;
      hasPassword: boolean;
    }>;

    const appUser = rows[0];

    if (!appUser.hasPassword) {
      await createPasswordSetupToken(res, appUser.id);
      return redirect(res, "/?auth=password-setup");
    }

    await createSession(res, appUser.id, getClientIp(req), getHeader(req, "user-agent"));
    return redirect(res, "/?auth=discord-ok");
  } catch (error) {
    console.error("discord_callback_error", error);
    return redirect(res, "/?auth=discord-error");
  }
}
