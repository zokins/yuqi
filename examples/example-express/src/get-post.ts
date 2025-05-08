import { apiBlog } from "@yuqijs/example-contracts";
import { initServer } from "@yuqijs/express";

import { mockPostFixtureFactory } from "./fixtures";

const s = initServer();
export const getPost = s.route(apiBlog.getPost, async ({ params: { id } }) => {
  const post = mockPostFixtureFactory({ id });

  if (!post) {
    return {
      status: 404,
      body: null,
    };
  }

  return {
    status: 200,
    body: post,
  };
});
