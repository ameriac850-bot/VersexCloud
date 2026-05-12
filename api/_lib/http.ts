import type { ApiRequest, ApiResponse } from "./types";

export function setNoStore(res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export function sendJson(res: ApiResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function methodNotAllowed(res: ApiResponse, methods: string[]) {
  res.setHeader("Allow", methods.join(", "));
  return sendJson(res, 405, { error: "Metodo nao permitido." });
}

export function badRequest(res: ApiResponse, error = "Requisicao invalida.") {
  return sendJson(res, 400, { error });
}

export async function readJsonBody(req: ApiRequest) {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body) as Record<string, unknown>;
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as Record<string, unknown>;
}

export function getClientIp(req: ApiRequest) {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}

export function getHeader(req: ApiRequest, name: string) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || "";
}

export function appendSetCookie(res: ApiResponse, cookie: string) {
  const existing = res.getHeader("Set-Cookie");

  if (!existing) {
    res.setHeader("Set-Cookie", cookie);
    return;
  }

  res.setHeader("Set-Cookie", [
    ...(Array.isArray(existing) ? existing.map(String) : [String(existing)]),
    cookie,
  ]);
}
