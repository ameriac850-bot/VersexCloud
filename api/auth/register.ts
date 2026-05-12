import type { ApiRequest, ApiResponse } from "../_lib/types";
import { methodNotAllowed, sendJson, setNoStore } from "../_lib/http";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoStore(res);

  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  return sendJson(res, 410, { error: "Registro somente pelo Discord." });
}
