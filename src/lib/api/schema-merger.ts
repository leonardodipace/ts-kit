import type { Middleware } from "./middleware.js";
import type { RequestSchema, ResponseSchema } from "./types.js";

export function mergeRequestSchemas(
  ...schemas: (RequestSchema | undefined)[]
): RequestSchema {
  const merged: RequestSchema = {};

  for (const schema of schemas) {
    if (!schema) continue;

    for (const key of [
      "body",
      "params",
      "query",
      "headers",
      "cookies",
    ] as const) {
      if (schema[key]) {
        merged[key] = schema[key];
      }
    }
  }

  return merged;
}

export function mergeResponseSchemas(
  ...schemas: (ResponseSchema | undefined)[]
): ResponseSchema {
  const merged: ResponseSchema = {};

  for (const schema of schemas) {
    if (!schema) continue;

    for (const [status, value] of Object.entries(schema)) {
      merged[Number(status)] = value;
    }
  }

  return merged;
}

export function extractMiddlewareSchemas(middlewares: readonly Middleware[]): {
  requestSchema: RequestSchema;
  responseSchema: ResponseSchema;
} {
  const requestSchemas = middlewares.map((m) => m.getRequestSchema());
  const responseSchemas = middlewares.map((m) => m.getResponseSchema());

  return {
    requestSchema: mergeRequestSchemas(...requestSchemas),
    responseSchema: mergeResponseSchemas(...responseSchemas),
  };
}
