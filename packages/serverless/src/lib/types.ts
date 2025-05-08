import {
  AppRoute,
  AppRouter,
  ServerInferRequest,
  ServerInferResponses,
  ZodErrorSchema,
} from "@ts-rest/core";
import { CorsOptions, RequestHandler } from "itty-router";
import { z } from "zod";

import { TsRestHttpError } from "./http-error";
import { TsRestRequest } from "./request";
import { TsRestResponse } from "./response";
import { CompleteRouter, RouterBuilder } from "./router-builder";

export class RequestValidationError extends TsRestHttpError {
  constructor(
    public pathParamsError: z.ZodError | null,
    public headersError: z.ZodError | null,
    public queryError: z.ZodError | null,
    public bodyError: z.ZodError | null,
  ) {
    super(400, {
      message: "Request validation failed",
      pathParameterErrors: pathParamsError,
      headerErrors: headersError,
      queryParameterErrors: queryError,
      bodyErrors: bodyError,
    });
  }
}

export const RequestValidationErrorSchema = z.object({
  message: z.literal("Request validation failed"),
  pathParameterErrors: ZodErrorSchema.nullable(),
  headerErrors: ZodErrorSchema.nullable(),
  queryParameterErrors: ZodErrorSchema.nullable(),
  bodyErrors: ZodErrorSchema.nullable(),
});

export class ResponseValidationError extends TsRestHttpError {
  constructor(
    public appRoute: AppRoute,
    public error: z.ZodError,
  ) {
    super(500, {
      message: "Server Error",
    });

    this.message = `[Yuqi] Response validation failed for ${appRoute.method} ${appRoute.path}: ${error.message}`;
  }
}

export type AppRouteImplementation<
  T extends AppRoute,
  TPlatformArgs,
  TRequestExtension,
> = (
  args: ServerInferRequest<T>,
  context: TPlatformArgs & {
    appRoute: T;
    request: TsRestRequest & TRequestExtension;
    responseHeaders: Headers;
  },
) => Promise<ServerInferResponses<T>>;

export interface AppRouteOptions<
  TRoute extends AppRoute,
  TPlatformArgs,
  TRequestExtension,
> {
  middleware?: RequestHandler<
    TsRestRequest & TRequestExtension,
    [TPlatformArgs]
  >[];
  handler: AppRouteImplementation<TRoute, TPlatformArgs, TRequestExtension>;
}

export type AppRouteImplementationOrOptions<
  TRoute extends AppRoute,
  TPlatformArgs,
  TRequestExtension,
> =
  | AppRouteOptions<TRoute, TPlatformArgs, TRequestExtension>
  | AppRouteImplementation<TRoute, TPlatformArgs, TRequestExtension>;

export const isAppRouteImplementation = <
  TRoute extends AppRoute,
  TPlatformArgs,
  TRequestExtension,
>(
  obj: AppRouteImplementationOrOptions<
    TRoute,
    TPlatformArgs,
    TRequestExtension
  >,
): obj is AppRouteImplementation<TRoute, TPlatformArgs, TRequestExtension> => {
  return typeof obj === "function";
};

export const isRouterImplementation = <
  T extends AppRouter,
  TPlatformArgs,
  TRequestExtension,
>(
  obj:
    | RouterImplementation<T, TPlatformArgs, TRequestExtension>
    | AppRouteImplementationOrOptions<any, TPlatformArgs, TRequestExtension>,
): obj is RouterImplementation<T, TPlatformArgs, TRequestExtension> => {
  return typeof obj === "object" && typeof obj?.handler !== "function";
};

export type RouterImplementation<
  T extends AppRouter,
  TPlatformArgs,
  TRequestExtension,
> = {
  [TKey in keyof T]: T[TKey] extends AppRouter
    ? RouterImplementation<T[TKey], TPlatformArgs, TRequestExtension>
    : T[TKey] extends AppRoute
    ? AppRouteImplementationOrOptions<T[TKey], TPlatformArgs, TRequestExtension>
    : never;
};

export type RouterImplementationOrFluentRouter<
  T extends AppRouter,
  TPlatformArgs,
  TRequestExtension,
> =
  | RouterImplementation<T, TPlatformArgs, TRequestExtension>
  | CompleteRouter<T, TPlatformArgs, TRequestExtension>;

export type ServerlessHandlerOptions<
  TPlatformArgs = {},
  TRequestExtension = {},
> = {
  jsonQuery?: boolean;
  responseValidation?: boolean;
  errorHandler?: (
    err: unknown,
    req: TsRestRequest,
  ) => TsRestResponse | Promise<TsRestResponse> | void | Promise<void>;
  cors?: CorsOptions | false;
  basePath?: string;
  requestMiddleware?: RequestHandler<
    TsRestRequest & TRequestExtension,
    [TPlatformArgs]
  >[];
  responseHandlers?: Array<
    (
      response: TsRestResponse,
      request: TsRestRequest & TRequestExtension,
      args: TPlatformArgs,
    ) => TsRestResponse | Promise<TsRestResponse> | void | Promise<void>
  >;
};

export const createTsr = <TPlatformContext = {}>() => ({
  router: <
    T extends AppRouter,
    TRequestExtension = {},
    TRouter extends RouterImplementation<
      T,
      TPlatformContext,
      TRequestExtension
    > = RouterImplementation<T, TPlatformContext, TRequestExtension>,
  >(
    contract: T,
    router: TRouter,
  ) => router,
  routerWithMiddleware:
    <T extends AppRouter>(contract: T) =>
    <
      TRequestExtension,
      TRouter extends RouterImplementation<
        T,
        TPlatformContext,
        TRequestExtension
      > = RouterImplementation<T, TPlatformContext, TRequestExtension>,
    >(
      router: TRouter,
    ) =>
      router,
  routerBuilder: <T extends AppRouter>(contract: T) => {
    return new RouterBuilder<T, TPlatformContext, {}>(contract);
  },
  route: <
    T extends AppRoute,
    TRequestExtension = {},
    TRoute extends AppRouteImplementationOrOptions<
      T,
      TPlatformContext,
      TRequestExtension
    > = AppRouteImplementationOrOptions<T, TPlatformContext, TRequestExtension>,
  >(
    contractEndpoint: T,
    route: TRoute,
  ) => route,
  routeWithMiddleware:
    <T extends AppRoute>(contractEndpoint: T) =>
    <TRequestGlobalExtension, TRequestLocalExtension>(
      route: AppRouteOptions<
        T,
        TPlatformContext,
        TRequestGlobalExtension & TRequestLocalExtension
      >,
    ) =>
      route as AppRouteOptions<T, TPlatformContext, TRequestGlobalExtension>,
  middleware: <
    TRequestExtension,
    TMiddleware extends RequestHandler<
      TsRestRequest & TRequestExtension,
      [TPlatformContext]
    > = RequestHandler<TsRestRequest & TRequestExtension, [TPlatformContext]>,
  >(
    middleware: TMiddleware,
  ) => middleware,
});
