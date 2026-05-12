import type { ApiRequest } from "./types";
import { getHeader } from "./http";

const DISCORD_API = "https://discord.com/api/v10";
const DEFAULT_GUILD_ID = "1278075287195881472";
const DISCORD_STATE_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-versex_discord_state" : "versex_discord_state";

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

export function getOrigin(req?: ApiRequest) {
  if (!req) return "http://localhost:5174";

  const host = getHeader(req, "x-forwarded-host") || getHeader(req, "host");
  const proto = getHeader(req, "x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export function getDiscordConfig(req?: ApiRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID || DEFAULT_GUILD_ID;
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI || `${getOrigin(req)}/api/auth/discord/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Discord OAuth is not configured.");
  }

  return { clientId, clientSecret, guildId, redirectUri };
}

export function getDiscordStateCookie(req: ApiRequest) {
  if (req.cookies?.[DISCORD_STATE_COOKIE]) return req.cookies[DISCORD_STATE_COOKIE];

  const cookie = getHeader(req, "cookie");
  const prefix = `${DISCORD_STATE_COOKIE}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export function discordStateCookie(state: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DISCORD_STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
}

export function clearDiscordStateCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DISCORD_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function buildDiscordAuthorizeUrl(req: ApiRequest, state: string) {
  const { clientId, redirectUri } = getDiscordConfig(req);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds guilds.members.read",
    state,
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(req: ApiRequest, code: string) {
  const { clientId, clientSecret, redirectUri } = getDiscordConfig(req);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Discord token exchange failed.");
  }

  return (await response.json()) as DiscordTokenResponse;
}

export async function getDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Discord user fetch failed.");
  }

  return (await response.json()) as DiscordUser;
}

export async function isDiscordGuildMember(accessToken: string, guildId: string) {
  const memberResponse = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (memberResponse.ok) return true;

  const guildsResponse = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!guildsResponse.ok) return false;

  const guilds = (await guildsResponse.json()) as Array<{ id: string }>;
  return guilds.some((guild) => guild.id === guildId);
}
