import { QueryClient } from "@tanstack/react-query";
import { AppRouter, ClientArgs } from "@ts-rest/core";
import * as React from "react";

import { initHooksContainer, initQueryClient } from "./internal/create-hooks";
import { TsRestInnerProvider } from "./internal/provider-inner";
import { useTsrQueryClient } from "./internal/use-tsr-query-client";

export const initTsrReactQuery = <
  TContract extends AppRouter,
  TClientArgs extends ClientArgs,
>(
  contract: TContract,
  clientOptions: TClientArgs,
) => {
  return {
    ReactQueryProvider: function ({ children }: React.PropsWithChildren) {
      return (
        <TsRestInnerProvider contract={contract} clientOptions={clientOptions}>
          {children}
        </TsRestInnerProvider>
      );
    },
    ...initHooksContainer(contract, clientOptions),
    useQueryClient: useTsrQueryClient<TContract, TClientArgs>,
    initQueryClient: (queryClient: QueryClient) => {
      return initQueryClient(contract, clientOptions, queryClient);
    },
  };
};
