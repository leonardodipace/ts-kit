import type { Server } from "bun";
import { mightThrow } from "../errors/index.js";
import { RequestContext } from "./context.js";
import { generateOpenApiSpec } from "./openapi.js";
import {
  convertPathToBunFormat,
  parseCookies,
  parseQueryString,
} from "./router.js";
import type {
  ApiOptions,
  InternalRoute,
  RequestSchema,
  ResponseSchema,
  RouteDefinition,
} from "./types.js";
import { validateSchema } from "./validator.js";

export class Api {
  private options: ApiOptions;
  private routes: InternalRoute[] = [];
  private server: Server<unknown> | null = null;

  constructor(options: ApiOptions = {}) {
    this.options = options;
  }

  public defineRoute<
    TRequest extends RequestSchema = RequestSchema,
    TResponse extends ResponseSchema = ResponseSchema,
  >(definition: RouteDefinition<TRequest, TResponse>): void {
    const fullPath = this.options.prefix
      ? `${this.options.prefix}${definition.path}`
      : definition.path;

    const bunPath = convertPathToBunFormat(fullPath);

    const wrappedHandler = async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      const query = parseQueryString(url);
      const cookies = parseCookies(req.headers.get("cookie"));

      const params = (req as { params?: Record<string, string> }).params || {};

      let body: unknown;
      if (definition.request?.body) {
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const [parseError, parsedBody] = await mightThrow(req.json());
          if (parseError) {
            return Response.json(
              { error: "Invalid JSON body" },
              { status: 400 },
            );
          }
          body = parsedBody;
        }
      }

      const headers: Record<string, string> = {};
      if (definition.request?.headers) {
        req.headers.forEach((value, key) => {
          headers[key] = value;
        });
      }

      const [bodyError, validatedBody] = await validateSchema(
        definition.request?.body,
        body,
      );
      if (bodyError) {
        return Response.json({ error: bodyError.message }, { status: 400 });
      }

      const [paramsError, validatedParams] = await validateSchema(
        definition.request?.params,
        params,
      );
      if (paramsError) {
        return Response.json({ error: paramsError.message }, { status: 400 });
      }

      const [queryError, validatedQuery] = await validateSchema(
        definition.request?.query,
        query,
      );
      if (queryError) {
        return Response.json({ error: queryError.message }, { status: 400 });
      }

      const [headersError, validatedHeaders] = await validateSchema(
        definition.request?.headers,
        headers,
      );
      if (headersError) {
        return Response.json({ error: headersError.message }, { status: 400 });
      }

      const [cookiesError, validatedCookies] = await validateSchema(
        definition.request?.cookies,
        cookies,
      );
      if (cookiesError) {
        return Response.json({ error: cookiesError.message }, { status: 400 });
      }

      const validateResponseFn = async (status: number, data: unknown) => {
        const responseSchema = definition.response[status];
        return validateSchema(responseSchema, data);
      };

      const context = new RequestContext<TRequest, TResponse>(
        req,
        {
          body: validatedBody,
          params: validatedParams,
          query: validatedQuery,
          headers: validatedHeaders,
          cookies: validatedCookies,
        },
        validateResponseFn,
      );

      const handlerResult = definition.handler(context);
      const [handlerError, response] = await mightThrow(
        Promise.resolve(handlerResult),
      );

      if (handlerError) {
        return Response.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }

      if (!response) {
        return Response.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }

      return response;
    };

    this.routes.push({
      path: bunPath,
      method: definition.method,
      handler: wrappedHandler,
      definition,
    });
  }

  public async getOpenApiSpec() {
    return generateOpenApiSpec(this.routes, this.options);
  }

  public listen(port: number, callback?: () => void): Server<unknown> {
    const bunRoutes: Record<
      string,
      Record<string, (req: Request) => Promise<Response>>
    > = {};

    for (const route of this.routes) {
      const { path, method, handler } = route;

      if (!bunRoutes[path]) {
        bunRoutes[path] = {};
      }

      bunRoutes[path][method] = handler;
    }

    this.server = Bun.serve({
      port,
      routes: bunRoutes,
      fetch: (_req) => {
        return new Response("Not Found", { status: 404 });
      },
    });

    if (callback) {
      callback();
    }

    return this.server;
  }

  public close(): void {
    if (this.server) {
      this.server.stop();
      this.server = null;
    }
  }
}

export type {
  ApiOptions,
  HandlerContext,
  HttpMethod,
  RequestSchema,
  ResponseSchema,
  RouteDefinition,
  StatusCode,
} from "./types.js";
