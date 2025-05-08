import {
  applyDecorators,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  SetMetadata,
  UseInterceptors,
} from "@nestjs/common";

import type { AppRoute } from "@yuqijs/core";

import {
  TsRestAppRouteMetadataKey,
  TsRestOptionsMetadataKey,
} from "./constants";
import type { TsRestOptions } from "./yuqijs-options";
import { TsRestInterceptor } from "./yuqijs.interceptor";

interface TsRestType {
  (appRoute: AppRoute, options?: TsRestOptions): MethodDecorator;
  (options: TsRestOptions): ClassDecorator;
}

/**
 * As a class decorator, you can configure yuqijs options. As a method decorator, you can assign the route and also configure options
 * @param appRouteOrOptions For a method decorator, this is the route. For a class decorator, this is the options
 * @param options For a method decorator, this is the options
 *
 * @deprecated Please use `TsRestHandler` instead - will be removed in v4
 */
export const TsRest: TsRestType = (
  appRouteOrOptions: AppRoute | TsRestOptions,
  options?: TsRestOptions,
) => {
  const decorators = [];

  const isMethodDecorator = "path" in appRouteOrOptions;
  const optionsToUse = isMethodDecorator ? options : appRouteOrOptions;

  if (isMethodDecorator) {
    decorators.push(
      ...[
        SetMetadata(TsRestAppRouteMetadataKey, appRouteOrOptions),
        getMethodDecorator(appRouteOrOptions),
        UseInterceptors(TsRestInterceptor),
      ],
    );
  }

  if (optionsToUse) {
    decorators.push(SetMetadata(TsRestOptionsMetadataKey, optionsToUse));
  }

  return applyDecorators(...decorators);
};

const getMethodDecorator = (appRoute: AppRoute) => {
  switch (appRoute.method) {
    case "DELETE":
      return Delete(appRoute.path);
    case "GET":
      return Get(appRoute.path);
    case "POST":
      return Post(appRoute.path);
    case "PATCH":
      return Patch(appRoute.path);
    case "PUT":
      return Put(appRoute.path);
  }
};

/**
 * @deprecated Please use `TsRestHandler` instead - will be removed in v4
 */
export const Api = (appRoute: AppRoute): MethodDecorator => {
  return TsRest(appRoute);
};
