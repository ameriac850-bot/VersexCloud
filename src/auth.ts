export type AuthUser = {
  id: string;
  email: string | null;
  name: string;
  discordUsername: string | null;
  hasPassword: boolean;
};

type AuthResponse = {
  user: AuthUser;
};

type ApiErrorBody = {
  error?: string;
  message?: string;
};

async function parseResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    throw new Error(body.error || body.message || "Nao foi possivel concluir a acao.");
  }

  return body;
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (response.status === 401) return null;

  const body = (await parseResponse(response)) as AuthResponse;
  return body.user;
}

export async function login(identifier: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  const body = (await parseResponse(response)) as AuthResponse;
  return body.user;
}

export function startDiscordAuth() {
  window.location.assign("/api/auth/discord/start");
}

export async function setSitePassword(password: string) {
  const response = await fetch("/api/auth/password", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const body = (await parseResponse(response)) as AuthResponse;
  return body.user;
}

export async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
}
