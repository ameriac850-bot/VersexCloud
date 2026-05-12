import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, setNoStore } from "../_lib/http";
import { clearSessionCookie, revokeCurrentSession } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    await revokeCurrentSession(req);
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("logout_error", error);
    return res.status(500).json({ error: "Nao foi possivel sair agora." });
  }
}
