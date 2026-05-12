import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, setNoStore } from "../_lib/http";
import { getCurrentUser } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("me_error", error);
    return res.status(500).json({ error: "Nao foi possivel carregar a sessao." });
  }
}
