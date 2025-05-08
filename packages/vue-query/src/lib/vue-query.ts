import type {
  AppRoute,
  AppRouteFunction,
  AppRouteMutation,
  AppRouteQuery,
  AppRouter,
  ClientArgs,
  Without} from "@yuqijs/core";
import {
  getRouteQuery,
  isAppRoute
} from "@yuqijs/core";

import type {
  DataReturnInfiniteQuery} from "./use-infinite-query";
import {
  getRouteUseInfiniteQuery,
} from "./use-infinite-query";
import type { DataReturnMutation} from "./use-mutation";
import { getRouteUseMutation } from "./use-mutation";
import type { DataReturnQuery} from "./use-query";
import { getRouteUseQuery } from "./use-query";

interface UseQueryArgs<
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
> {
  useQuery: TAppRoute extends AppRouteQuery
    ? DataReturnQuery<TAppRoute, TClientArgs>
    : never;
  useInfiniteQuery: TAppRoute extends AppRouteQuery
    ? DataReturnInfiniteQuery<TAppRoute, TClientArgs>
    : never;
  query: TAppRoute extends AppRouteQuery
    ? AppRouteFunction<TAppRoute, TClientArgs>
    : never;
  useMutation: TAppRoute extends AppRouteMutation
    ? DataReturnMutation<TAppRoute, TClientArgs>
    : never;
  mutation: TAppRoute extends AppRouteMutation
    ? AppRouteFunction<TAppRoute, TClientArgs>
    : never;
}

type RecursiveProxyObj<T extends AppRouter, TClientArgs extends ClientArgs> = {
  [TKey in keyof T]: T[TKey] extends AppRoute
    ? Without<UseQueryArgs<T[TKey], TClientArgs>, never>
    : T[TKey] extends AppRouter
      ? RecursiveProxyObj<T[TKey], TClientArgs>
      : never;
};

/** @deprecated Use `TsRestVueQueryClient` instead */
export type InitClientReturn<
  T extends AppRouter,
  TClientArgs extends ClientArgs,
> = TsRestVueQueryClient<T, TClientArgs>;

export type TsRestVueQueryClient<
  T extends AppRouter,
  TClientArgs extends ClientArgs,
> = RecursiveProxyObj<T, TClientArgs>;

export const initQueryClient = <
  T extends AppRouter,
  TClientArgs extends ClientArgs,
>(
  router: T,
  args: TClientArgs,
): TsRestVueQueryClient<T, TClientArgs> =>
  Object.fromEntries(
    Object.entries(router).map(([key, subRouter]) =>
      isAppRoute(subRouter)
        ? [
            key,
            {
              query: getRouteQuery(subRouter, args),
              mutation: getRouteQuery(subRouter, args),
              useQuery: getRouteUseQuery(subRouter, args),
              useInfiniteQuery: getRouteUseInfiniteQuery(subRouter, args),
              useMutation: getRouteUseMutation(subRouter, args),
            },
          ]
        : [key, initQueryClient(subRouter, args)],
    ),
  );
