import type { UseSuspenseQueryResult } from "@tanstack/react-query";

import type { AppRoute, ClientArgs } from "@yuqijs/core";

import type { DataResponse, ErrorResponse } from "../types/common";
import type { UseSuspenseQueryOptions } from "../types/hooks-options";

type GetUseSuspenseQueryOptions<
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
  T,
> = T extends {
  select?: (data: any) => infer TData;
}
  ? UseSuspenseQueryOptions<TAppRoute, TClientArgs, TData>
  : UseSuspenseQueryOptions<TAppRoute, TClientArgs>;

type GetUseSuspenseQueryResult<TAppRoute extends AppRoute, T> = T extends {
  select?: (data: any) => infer TData;
}
  ? UseSuspenseQueryResult<
      TAppRoute,
      unknown extends TData ? DataResponse<TAppRoute> : TData
    >
  : UseSuspenseQueryResult<TAppRoute>;

type MAXIMUM_DEPTH = 20;

export type SuspenseQueriesOptions<
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
  T extends any[],
  TResults extends any[] = [],
  TDepth extends readonly number[] = [],
> = TDepth["length"] extends MAXIMUM_DEPTH
  ? UseSuspenseQueryOptions<TAppRoute, TClientArgs>[]
  : T extends []
    ? []
    : T extends [infer Head]
      ? [...TResults, GetUseSuspenseQueryOptions<TAppRoute, TClientArgs, Head>]
      : T extends [infer Head, ...infer Tails]
        ? SuspenseQueriesOptions<
            TAppRoute,
            TClientArgs,
            [...Tails],
            [
              ...TResults,
              GetUseSuspenseQueryOptions<TAppRoute, TClientArgs, Head>,
            ],
            [...TDepth, 1]
          >
        : unknown[] extends T
          ? T
          : T extends UseSuspenseQueryOptions<TAppRoute, TClientArgs, infer TData>[]
            ? UseSuspenseQueryOptions<TAppRoute, TClientArgs, TData>[]
            : UseSuspenseQueryOptions<TAppRoute, TClientArgs>[];

export type SuspenseQueriesResults<
  TAppRoute extends AppRoute,
  T extends any[],
  TResults extends any[] = [],
  TDepth extends readonly number[] = [],
> = TDepth["length"] extends MAXIMUM_DEPTH
  ? UseSuspenseQueryResult[]
  : T extends []
    ? []
    : T extends [infer Head]
      ? [...TResults, GetUseSuspenseQueryResult<TAppRoute, Head>]
      : T extends [infer Head, ...infer Tails]
        ? SuspenseQueriesResults<
            TAppRoute,
            [...Tails],
            [...TResults, GetUseSuspenseQueryResult<TAppRoute, Head>],
            [...TDepth, 1]
          >
        : T extends UseSuspenseQueryOptions<TAppRoute, ClientArgs, infer TData>[]
          ? UseSuspenseQueryResult<
                unknown extends TData ? DataResponse<TAppRoute> : TData,
                ErrorResponse<TAppRoute>
              >[]
          : UseSuspenseQueryResult[];
