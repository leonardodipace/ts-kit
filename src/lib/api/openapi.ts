import { toOpenAPISchema } from "@standard-community/standard-openapi";
import type { ApiOptions, InternalRoute } from "./types.js";

export type OpenApiSpec = {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  paths: Record<string, Record<string, unknown>>;
};

export const generateOpenApiSpec = async (
  routes: InternalRoute[],
  options: ApiOptions,
): Promise<OpenApiSpec> => {
  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: options.openapi?.title || "API",
      description: options.openapi?.description,
      version: options.openapi?.version || "1.0.0",
    },
    paths: {},
  };

  for (const route of routes) {
    const { definition, path } = route;
    const openapiPath = path.replace(/:(\w+)/g, "{$1}");

    if (!spec.paths[openapiPath]) {
      spec.paths[openapiPath] = {};
    }

    const operation: Record<string, unknown> = {
      operationId: definition.operationId,
      summary: definition.summary,
      description: definition.description,
      tags: definition.tags,
      parameters: [],
      responses: {},
    };

    if (definition.request?.params) {
      const paramResult = await toOpenAPISchema(definition.request.params);
      const paramSchema = paramResult.schema;
      if (paramSchema.properties) {
        for (const [name, schema] of Object.entries(paramSchema.properties)) {
          (operation.parameters as unknown[]).push({
            name,
            in: "path",
            required: true,
            schema,
          });
        }
      }
    }

    if (definition.request?.query) {
      const queryResult = await toOpenAPISchema(definition.request.query);
      const querySchema = queryResult.schema;
      if (querySchema.properties) {
        for (const [name, schema] of Object.entries(querySchema.properties)) {
          const required = Array.isArray(querySchema.required)
            ? querySchema.required.includes(name)
            : false;
          (operation.parameters as unknown[]).push({
            name,
            in: "query",
            required,
            schema,
          });
        }
      }
    }

    if (definition.request?.headers) {
      const headerResult = await toOpenAPISchema(definition.request.headers);
      const headerSchema = headerResult.schema;
      if (headerSchema.properties) {
        for (const [name, schema] of Object.entries(headerSchema.properties)) {
          const required = Array.isArray(headerSchema.required)
            ? headerSchema.required.includes(name)
            : false;
          (operation.parameters as unknown[]).push({
            name,
            in: "header",
            required,
            schema,
          });
        }
      }
    }

    if (definition.request?.cookies) {
      const cookieResult = await toOpenAPISchema(definition.request.cookies);
      const cookieSchema = cookieResult.schema;
      if (cookieSchema.properties) {
        for (const [name, schema] of Object.entries(cookieSchema.properties)) {
          const required = Array.isArray(cookieSchema.required)
            ? cookieSchema.required.includes(name)
            : false;
          (operation.parameters as unknown[]).push({
            name,
            in: "cookie",
            required,
            schema,
          });
        }
      }
    }

    if (definition.request?.body) {
      const bodyResult = await toOpenAPISchema(definition.request.body);
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: bodyResult.schema,
          },
        },
      };
    }

    for (const [status, schema] of Object.entries(definition.response)) {
      const responseResult = await toOpenAPISchema(schema);
      (operation.responses as Record<string, unknown>)[status] = {
        description: `Response for status ${status}`,
        content: {
          "application/json": {
            schema: responseResult.schema,
          },
        },
      };
    }

    spec.paths[openapiPath][definition.method.toLowerCase()] = operation;
  }

  return spec;
};
