import { createNextHandler } from '@ts-rest/serverless/next';
import { testContract } from '../../../../contracts/test-contract';

const handler = createNextHandler(
  testContract,
  {
    test: async ({ params, query }) => {
      return {
        status: 200,
        body: {
          ...params,
          ...query,
          deleteMe: 'response validation will delete me :(',
        },
      };
    },
  },
  {
    basePath: '/api/app-router',
    jsonQuery: true,
    responseValidation: true,
    handlerType: 'app-router',
  },
);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
