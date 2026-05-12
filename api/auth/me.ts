import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, sendJson, setNoStore } from "../_lib/http";
import { getCurrentUser } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return sendJson(res, 401, { user: null });
    }

    return sendJson(res, 200, { user });
  } catch (error) {
    console.error("me_error", error);
    return sendJson(res, 500, { error: "Nao foi possivel carregar a sessao." });
  }
}
