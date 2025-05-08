import type { Context } from "aws-lambda";

import type { AppRouter } from "@yuqijs/core";

import type {
  ApiGatewayEvent,
  ApiGatewayResponse} from "../mappers/aws/api-gateway";
import {
  requestFromEvent,
  responseToResult,
} from "../mappers/aws/api-gateway";
import { createServerlessRouter } from "../router";
import type {
  RouterImplementationOrFluentRouter,
  ServerlessHandlerOptions} from "../types";
import {
  createTsr
} from "../types";

interface LambdaPlatformArgs {
  rawEvent: ApiGatewayEvent;
  lambdaContext: Context;
}

export const tsr = createTsr<LambdaPlatformArgs>();

export type LambdaHandlerOptions<TRequestExtension = {}> =
  ServerlessHandlerOptions<LambdaPlatformArgs, TRequestExtension>;

export const createLambdaHandler = <T extends AppRouter, TRequestExtension>(
  contract: T,
  router: RouterImplementationOrFluentRouter<
    T,
    LambdaPlatformArgs,
    TRequestExtension
  >,
  options: LambdaHandlerOptions<TRequestExtension> = {},
) => {
  const serverlessRouter = createServerlessRouter<
    T,
    LambdaPlatformArgs,
    TRequestExtension
  >(contract, router, options);

  return async (
    event: ApiGatewayEvent,
    context: Context,
  ): Promise<ApiGatewayResponse> => {
    const request = requestFromEvent(event);

    return serverlessRouter
      .fetch(request, {
        rawEvent: event,
        lambdaContext: context,
      })
      .then(async (response) => {
        return responseToResult(event, response);
      });
  };
};
