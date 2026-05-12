import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, sendJson, setNoStore } from "../_lib/http";
import { clearSessionCookie, revokeCurrentSession } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    await revokeCurrentSession(req);
    res.setHeader("Set-Cookie", clearSessionCookie());
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("logout_error", error);
    return sendJson(res, 500, { error: "Nao foi possivel sair agora." });
  }
}
