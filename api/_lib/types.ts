import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & {
  body?: unknown;
  cookies?: Record<string, string>;
};

export type ApiResponse = ServerResponse & {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
};
