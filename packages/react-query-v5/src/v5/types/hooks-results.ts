import type {
  InfiniteData,
  DefinedUseInfiniteQueryResult as TanstackDefinedUseInfiniteQueryResult,
  DefinedUseQueryResult as TanstackDefinedUseQueryResult,
  UseInfiniteQueryResult as TanStackUseInfiniteQueryResult,
  UseMutationResult as TanStackUseMutationResult,
  UseQueryResult as TanStackUseQueryResult,
  UseSuspenseInfiniteQueryResult as TanStackUseSuspenseInfiniteQueryResult,
  UseSuspenseQueryResult as TanStackUseSuspenseQueryResult,
} from "@tanstack/react-query";

import type { AppRoute, ClientArgs } from "@yuqijs/core";

import type { QueriesResults } from "../internal/queries-options";
import type { SuspenseQueriesResults } from "../internal/suspense-queries-options";
import type { DataResponse, ErrorResponse, RequestData } from "./common";

export interface TsRestResult<TAppRoute extends AppRoute> {
  contractEndpoint: TAppRoute;
}

export type UseQueryResult<
  TAppRoute extends AppRoute,
  TData = DataResponse<TAppRoute>,
  TError = ErrorResponse<TAppRoute>,
> = TanStackUseQueryResult<TData, TError> & TsRestResult<TAppRoute>;

export type DefinedUseQueryResult<
  TAppRoute extends AppRoute,
  TData = DataResponse<TAppRoute>,
  TError = ErrorResponse<TAppRoute>,
> = TanstackDefinedUseQueryResult<TData, TError> & TsRestResult<TAppRoute>;

export type UseSuspenseQueryResult<
  TAppRoute extends AppRoute,
  TData = DataResponse<TAppRoute>,
  TError = ErrorResponse<TAppRoute>,
> = TanStackUseSuspenseQueryResult<TData, TError> & TsRestResult<TAppRoute>;

export type UseQueriesResult<
  TAppRoute extends AppRoute,
  TQueries extends any[],
> = QueriesResults<TAppRoute, TQueries>;

export type UseSuspenseQueriesResult<
  TAppRoute extends AppRoute,
  TQueries extends any[],
> = SuspenseQueriesResults<TAppRoute, TQueries>;

export type UseInfiniteQueryResult<
  TAppRoute extends AppRoute,
  TData = InfiniteData<DataResponse<TAppRoute>>,
  TError = ErrorResponse<TAppRoute>,
> = TanStackUseInfiniteQueryResult<TData, TError> & TsRestResult<TAppRoute>;

export type DefinedUseInfiniteQueryResult<
  TAppRoute extends AppRoute,
  TData = InfiniteData<DataResponse<TAppRoute>>,
  TError = ErrorResponse<TAppRoute>,
> = TanstackDefinedUseInfiniteQueryResult<TData, TError> &
  TsRestResult<TAppRoute>;

export type UseSuspenseInfiniteQueryResult<
  TAppRoute extends AppRoute,
  TData = InfiniteData<DataResponse<TAppRoute>>,
  TError = ErrorResponse<TAppRoute>,
> = TanStackUseSuspenseInfiniteQueryResult<TData, TError> &
  TsRestResult<TAppRoute>;

export type UseMutationResult<
  TAppRoute extends AppRoute,
  TClientArgs extends ClientArgs,
  TData = DataResponse<TAppRoute>,
  TError = ErrorResponse<TAppRoute>,
  TVariables = RequestData<TAppRoute, TClientArgs>,
  TContext = unknown,
> = TanStackUseMutationResult<TData, TError, TVariables, TContext> &
  TsRestResult<TAppRoute>;
