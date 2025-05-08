import { z } from "zod";

import { AppRoute } from "./dsl";

export class ResponseValidationError extends Error {
  constructor(
    public appRoute: AppRoute,
    public cause: z.ZodError,
  ) {
    super(
      `[Yuqi] Response validation failed for ${appRoute.method} ${appRoute.path}: ${cause.message}`,
    );
  }
}
