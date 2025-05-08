import type { NextRequest, NextResponse } from "next/server";

import type { AppRouter } from "@yuqijs/core";

import { TsRestRequest } from "../request";
import { createServerlessRouter } from "../router";
import type {
  RouterImplementationOrFluentRouter,
  ServerlessHandlerOptions} from "../types";
import {
  createTsr
} from "../types";

interface NextPlatformArgs {
  nextRequest: NextRequest;
}

export const tsr = createTsr<NextPlatformArgs>();

export type NextHandlerOptions<TRequestExtension> = ServerlessHandlerOptions<
  NextPlatformArgs,
  TRequestExtension
> & {
  handlerType: "app-router" | "pages-router-edge";
};

export const createNextHandler = <T extends AppRouter, TRequestExtension>(
  contract: T,
  router: RouterImplementationOrFluentRouter<
    T,
    NextPlatformArgs,
    TRequestExtension
  >,
  options: NextHandlerOptions<TRequestExtension>,
) => {
  const serverlessRouter = createServerlessRouter<
    T,
    NextPlatformArgs,
    TRequestExtension
  >(contract, router, options);

  return async (nextRequest: NextRequest): Promise<NextResponse> => {
    if (options.handlerType === "pages-router-edge") {
      if (!nextRequest.nextUrl.searchParams.has("yuqijs")) {
        throw new Error(
          "Please make sure your catch-all route file is named [...yuqijs]",
        );
      }

      nextRequest.nextUrl.searchParams.delete("yuqijs");
    }

    const request = new TsRestRequest(
      nextRequest.nextUrl.toString(),
      nextRequest,
    );

    return serverlessRouter.fetch(request, {
      nextRequest,
    });
  };
};
