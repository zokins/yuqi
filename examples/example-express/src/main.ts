import * as bodyParser from "body-parser";
import * as express from "express";
import { NextFunction, Request, Response } from "express";
import { serve, setup } from "swagger-ui-express";

import { initContract, ResponseValidationError } from "@yuqijs/core";
import { apiBlog, contractTs } from "@yuqijs/example-contracts";
import { createExpressEndpoints, initServer } from "@yuqijs/express";
import { generateOpenApi } from "@yuqijs/openapi";

import { mockPostFixtureFactory } from "./fixtures";
import { getPost } from "./get-post";
import { tsRouter } from "./ts-router";

import cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const completedRouter = s.router(apiBlog, {
  getPost,
  getPosts: async ({ query }) => {
    const posts = [
      mockPostFixtureFactory({ id: "1" }),
      mockPostFixtureFactory({ id: "2" }),
    ];

    return {
      status: 200,
      body: {
        posts,
        count: 0,
        skip: query.skip,
        take: query.take,
      },
    };
  },
  createPost: async ({ body }) => {
    const post = mockPostFixtureFactory(body);

    return {
      status: 201,
      body: post,
    };
  },
  updatePost: async ({ body }) => {
    const post = mockPostFixtureFactory(body);

    return {
      status: 200,
      body: post,
    };
  },
  deletePost: async () => {
    return {
      status: 200,
      body: { message: "Post deleted" },
    };
  },
  testPathParams: async ({ params }) => {
    return {
      status: 200,
      body: params,
    };
  },
});

const validateResponseContact = initContract().router({
  testPathParams: {
    ...apiBlog.testPathParams,
    path: "/validate-response/:id/:name",
  },
});

const openapi = generateOpenApi(apiBlog, {
  info: { title: "Play API", version: "0.1" },
});

const apiDocs = express.Router();

apiDocs.use(serve);
apiDocs.get("/", setup(openapi));

app.use("/api-docs", apiDocs);

app.get("/test", (req, res) => {
  return res.json(req.query);
});

createExpressEndpoints(apiBlog, completedRouter, app);
createExpressEndpoints(contractTs, tsRouter, app, { jsonQuery: true });
createExpressEndpoints(
  validateResponseContact,
  s.router(validateResponseContact, {
    testPathParams: async ({ params, query }) => {
      return {
        status: 200,
        body: {
          ...params,
          ...query,
        },
      };
    },
  }),
  app,
  { responseValidation: true },
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ResponseValidationError) {
    console.error(err.cause);
  }

  next(err);
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on("error", console.error);

export default app;
