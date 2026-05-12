import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, setNoStore } from "../_lib/http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  return res.status(410).json({ error: "Registro somente pelo Discord." });
}
