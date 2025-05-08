import type {
  EnsureQueryDataOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  QueryFilters,
  QueryKey,
  QueryState,
  SetDataOptions,
} from "@tanstack/react-query";

import type { AppRoute, ClientArgs } from "@yuqijs/core";

import type { DataResponse, ErrorResponse } from "./common";
import type { TsRestQueryOptions } from "./hooks-options";

type Updater<TInput, TOutput> = TOutput | ((input: TInput) => TOutput);

export interface TsRestQueryClientFunctions<
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
  TQueryFnData = DataResponse<TAppRoute>,
  TError = ErrorResponse<TAppRoute>,
> {
  getQueryData(queryKey: QueryKey): TQueryFnData | undefined;

  ensureQueryData<TData = TQueryFnData>(
    options: EnsureQueryDataOptions<TQueryFnData, TError, TData> &
      TsRestQueryOptions<TAppRoute, TClientArgs>,
  ): Promise<TData>;

  getQueriesData(
    filters: QueryFilters,
  ): [QueryKey, TQueryFnData | undefined][];

  setQueryData(
    queryKey: QueryKey,
    updater: Updater<TQueryFnData | undefined, TQueryFnData | undefined>,
    options?: SetDataOptions,
  ): TQueryFnData | undefined;

  setQueriesData(
    filters: QueryFilters,
    updater: Updater<TQueryFnData | undefined, TQueryFnData | undefined>,
    options?: SetDataOptions,
  ): [QueryKey, TQueryFnData | undefined][];

  getQueryState(
    queryKey: QueryKey,
  ): QueryState<TQueryFnData, TError> | undefined;

  fetchQuery<TData = TQueryFnData>(
    options: FetchQueryOptions<TQueryFnData, TError, TData> &
      TsRestQueryOptions<TAppRoute, TClientArgs>,
  ): Promise<TData>;

  prefetchQuery<TData = TQueryFnData>(
    options: FetchQueryOptions<TQueryFnData, TError, TData, QueryKey> &
      TsRestQueryOptions<TAppRoute, TClientArgs>,
  ): Promise<void>;

  fetchInfiniteQuery<TData = TQueryFnData, TPageParam = unknown>(
    options: FetchInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      QueryKey,
      TPageParam
    > &
      TsRestQueryOptions<TAppRoute, TClientArgs>,
  ): Promise<InfiniteData<TData, TPageParam>>;

  prefetchInfiniteQuery<TData = TQueryFnData, TPageParam = unknown>(
    options: FetchInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      QueryKey,
      TPageParam
    > &
      TsRestQueryOptions<TAppRoute, TClientArgs>,
  ): Promise<void>;
}
