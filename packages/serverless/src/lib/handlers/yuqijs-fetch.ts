import type { AppRouter } from "@yuqijs/core";

import { TsRestRequest } from "../request";
import { createServerlessRouter } from "../router";
import type {
  RouterImplementationOrFluentRouter,
  ServerlessHandlerOptions} from "../types";
import {
  createTsr
} from "../types";

export const tsr = {
  ...createTsr(),
  platformContext: <TPlatformContext>() => createTsr<TPlatformContext>(),
};

export type FetchHandlerOptions<
  TPlatformContext = {},
  TRequestExtension = {},
> = ServerlessHandlerOptions<TPlatformContext, TRequestExtension>;

export const createFetchHandler = <
  T extends AppRouter,
  TRequestExtension,
  TPlatformContext = {},
>(
  contract: T,
  router: RouterImplementationOrFluentRouter<
    T,
    TPlatformContext,
    TRequestExtension
  >,
  options: FetchHandlerOptions<TPlatformContext, TRequestExtension> = {},
) => {
  const serverlessRouter = createServerlessRouter<
    T,
    TPlatformContext,
    TRequestExtension
  >(contract, router, options);

  return async (request: Request, platformContext?: TPlatformContext) => {
    const tsRestRequest = new TsRestRequest(request);
    return serverlessRouter.fetch(tsRestRequest, {
      ...platformContext,
    });
  };
};

export const fetchRequestHandler = <
  T extends AppRouter,
  TRequestExtension,
  TPlatformContext = {},
>({
  contract,
  router,
  options = {},
  request,
  platformContext,
}: {
  contract: T;
  router: RouterImplementationOrFluentRouter<
    T,
    TPlatformContext,
    TRequestExtension
  >;
  options: FetchHandlerOptions<TPlatformContext, TRequestExtension>;
  request: Request;
  platformContext?: TPlatformContext;
}) => {
  const serverlessRouter = createServerlessRouter<
    T,
    TPlatformContext,
    TRequestExtension
  >(contract, router, options);

  const tsRestRequest = new TsRestRequest(request);
  return serverlessRouter.fetch(tsRestRequest, {
    ...platformContext,
  });
};
