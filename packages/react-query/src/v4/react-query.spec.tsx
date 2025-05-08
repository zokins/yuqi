import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { waitFor, renderHook } from '@testing-library/react';
import { ApiFetcher, initContract } from '@ts-rest/core';
import { initQueryClient, useTsRestQueryClient } from './react-query';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { z } from 'zod';

const c = initContract();

export type Post = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  published: boolean;
  authorId: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
};

const postsRouter = c.router(
  {
    getPost: {
      method: 'GET',
      path: `/posts/:id`,
      responses: {
        200: c.type<Post | null>(),
      },
    },
    getPosts: {
      method: 'GET',
      path: '/posts',
      responses: {
        200: c.type<Post[]>(),
      },
      query: z.object({
        take: z.number().optional(),
        skip: z.number().optional(),
      }),
    },
    createPost: {
      method: 'POST',
      path: '/posts',
      responses: {
        200: c.type<Post>(),
      },
      body: z.object({
        title: z.string(),
        content: z.string(),
        published: z.boolean().optional(),
        description: z.string().optional(),
        authorId: z.string(),
      }),
    },
    mutationWithQuery: {
      method: 'POST',
      path: '/posts',
      responses: {
        200: c.type<Post>(),
      },
      body: z.object({}),
      query: z.object({
        test: z.string(),
      }),
    },
    updatePost: {
      method: 'PUT',
      path: `/posts/:id`,
      responses: {
        200: c.type<Post>(),
      },
      body: z.object({
        title: z.string(),
        content: z.string(),
        published: z.boolean().optional(),
        description: z.string().optional(),
        authorId: z.string(),
      }),
    },
    patchPost: {
      method: 'PATCH',
      path: `/posts/:id`,
      responses: {
        200: c.type<Post>(),
      },
      body: null,
    },
    deletePost: {
      method: 'DELETE',
      path: `/posts/:id`,
      responses: {
        200: c.type<boolean>(),
      },
      body: null,
    },
    uploadImage: {
      method: 'POST',
      path: `/posts/:id/image`,
      responses: {
        200: c.type<Post>(),
      },
      contentType: 'multipart/form-data',
      body: c.body<{ image: File }>(),
    },
  },
  {
    baseHeaders: z.object({
      'x-test': z.string(),
    }),
  },
);

// Three endpoints, two for posts, and one for health
export const router = c.router({
  posts: postsRouter,
  health: {
    method: 'GET',
    path: '/health',
    responses: {
      200: c.type<{ message: string }>(),
      503: c.type<{ message: string }>(),
    },
  },
});

const api = jest.fn();

const client = initQueryClient(router, {
  baseUrl: 'https://api.com',
  baseHeaders: {
    'x-test': 'test',
  },
  api: api as ApiFetcher,
});

const clientWithThrownErrors = initQueryClient(router, {
  baseUrl: 'https://api.com',
  baseHeaders: {
    'x-test': 'test',
  },
  api: api as ApiFetcher,
  includeThrownErrorsInErrorType: true,
});

let queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const SUCCESS_RESPONSE = {
  status: 200,
  body: {
    posts: [],
  },
};

const ERROR_RESPONSE = {
  status: 503,
  body: {
    message: 'Internal Server Error',
  },
};

describe('react-query', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
    api.mockReset();
  });

  it('useQuery should handle success', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(() => client.health.useQuery(['health']), {
      wrapper,
    });

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/health',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.health,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
    });

    expect(result.current.data).toStrictEqual(SUCCESS_RESPONSE);
  });

  it('useQuery with select should handle success', async () => {
    api.mockResolvedValue({ status: 200, body: { message: 'hello world' } });

    const { result } = renderHook(
      () =>
        client.health.useQuery(
          ['health'],
          {},
          {
            select: (data) => data.body.message,
          },
        ),
      {
        wrapper,
      },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/health',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.health,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
    });

    expect(result.current.data).toStrictEqual('hello world');
  });

  it('useQuery should accept extra headers', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQuery(['post', '1'], {
          params: {
            id: '1',
          },
          headers: {
            'x-test': 'test',
          },
        }),
      {
        wrapper,
      },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('useQuery should override base headers', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQuery(['post', '1'], {
          params: {
            id: '1',
          },
          headers: {
            'x-test': 'foo',
          },
          extraHeaders: {
            'content-type': 'application/xml',
          },
        }),
      {
        wrapper,
      },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'content-type': 'application/xml',
        'x-test': 'foo',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('useQuery should remove header if value is undefined', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQuery(['post', '1'], {
          params: {
            id: '1',
          },
          extraHeaders: {
            'content-type': undefined,
          },
        }),
      {
        wrapper,
      },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('useQuery should accept non-json string response', () => {
    api.mockResolvedValue({
      status: 200,
      body: 'Hello World',
    });

    const { result } = renderHook(() => client.health.useQuery(['health']), {
      wrapper,
    });

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/health',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.health,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    return waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
      expect(result.current.data).toStrictEqual({
        status: 200,
        body: 'Hello World',
      });
    });
  });

  it('useQuery should handle failure', async () => {
    api.mockResolvedValue(ERROR_RESPONSE);

    const { result } = renderHook(
      () => client.health.useQuery(['health'], {}, { retry: () => false }),
      { wrapper },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/health',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.health,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
    });

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current.error!.status).toStrictEqual(503);
  });

  it('useQuery should handle failure with connection failure', async () => {
    api.mockImplementation(() => {
      throw new TypeError();
    });

    const { result } = renderHook(
      () =>
        clientWithThrownErrors.health.useQuery(
          ['health'],
          {},
          { retry: () => false },
        ),
      { wrapper },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/health',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.health,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
    });

    expect(result.current.data).toStrictEqual(undefined);
    expect(result.current.error).toBeInstanceOf(TypeError);

    // @ts-expect-error - error might be an exception - so not guaranteed to have a status property
    expect(result.current.error!.status).toStrictEqual(undefined);
  });

  it('should handle mutation', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(() => client.posts.createPost.useMutation(), {
      wrapper,
    });

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(false);

    expect(result.current.error).toStrictEqual(null);

    await act(() =>
      result.current.mutateAsync({
        body: {
          description: 'test',
          title: 'test',
          content: '',
          authorId: '1',
        },
      }),
    );

    expect(api).toHaveBeenCalledWith({
      method: 'POST',
      path: 'https://api.com/posts',
      body: JSON.stringify({
        description: 'test',
        title: 'test',
        content: '',
        authorId: '1',
      }),
      headers: {
        'content-type': 'application/json',
        'x-test': 'test',
      },
      rawBody: {
        authorId: '1',
        content: '',
        description: 'test',
        title: 'test',
      },
      contentType: 'application/json',
      route: router.posts.createPost,
      signal: undefined,
      fetchOptions: {},
    });

    await waitFor(() => {
      expect(result.current.data).not.toBeUndefined();
    });

    expect(result.current.data).toStrictEqual(SUCCESS_RESPONSE);
    expect(result.current.error).toEqual(null);
  });

  it('should handle mutation with failure', async () => {
    api.mockResolvedValue(ERROR_RESPONSE);

    const { result } = renderHook(() => client.posts.createPost.useMutation(), {
      wrapper,
    });

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(false);

    expect(result.current.error).toStrictEqual(null);

    await act(() =>
      result.current
        .mutateAsync({
          body: {
            description: 'test',
            title: 'test',
            content: '',
            authorId: '1',
          },
        })
        .catch(() => {}),
    );

    expect(api).toHaveBeenCalledWith({
      method: 'POST',
      path: 'https://api.com/posts',
      body: JSON.stringify({
        description: 'test',
        title: 'test',
        content: '',
        authorId: '1',
      }),
      headers: {
        'content-type': 'application/json',
        'x-test': 'test',
      },
      rawBody: {
        authorId: '1',
        content: '',
        description: 'test',
        title: 'test',
      },
      contentType: 'application/json',
      route: router.posts.createPost,
      signal: undefined,
      fetchOptions: {},
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
    });

    expect(result.current.data).toStrictEqual(undefined);
    expect(result.current.error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current.error!.status).toStrictEqual(503);
  });

  it('should handle mutation with connection failure', async () => {
    api.mockImplementation(() => {
      throw new TypeError();
    });

    const { result } = renderHook(
      () => clientWithThrownErrors.posts.createPost.useMutation(),
      {
        wrapper,
      },
    );

    expect(result.current.data).toStrictEqual(undefined);

    expect(result.current.isLoading).toStrictEqual(false);

    expect(result.current.error).toStrictEqual(null);

    await act(() =>
      result.current
        .mutateAsync({
          body: {
            description: 'test',
            title: 'test',
            content: '',
            authorId: '1',
          },
        })
        .catch(() => {}),
    );

    expect(api).toHaveBeenCalledWith({
      method: 'POST',
      path: 'https://api.com/posts',
      body: JSON.stringify({
        description: 'test',
        title: 'test',
        content: '',
        authorId: '1',
      }),
      headers: {
        'content-type': 'application/json',
        'x-test': 'test',
      },
      rawBody: {
        authorId: '1',
        content: '',
        description: 'test',
        title: 'test',
      },
      contentType: 'application/json',
      route: router.posts.createPost,
      signal: undefined,
      fetchOptions: {},
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
    });

    expect(result.current.data).toStrictEqual(undefined);
    expect(result.current.error).toBeInstanceOf(TypeError);

    // @ts-expect-error - error might be an exception - so not guaranteed to have a status property
    expect(result.current.error!.status).toStrictEqual(undefined);
  });

  it('useQueries should handle success', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQueries({
          queries: [
            {
              queryKey: ['posts', '1'],
              params: {
                id: '1',
              },
            },
            {
              queryKey: ['posts', '2'],
              params: {
                id: '2',
              },
            },
          ],
        }),
      {
        wrapper,
      },
    );

    expect(result.current[0].data).toStrictEqual(undefined);

    expect(result.current[0].isLoading).toStrictEqual(true);

    expect(result.current[1].data).toStrictEqual(undefined);

    expect(result.current[1].isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/2',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current[0].isLoading).toStrictEqual(false);
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toStrictEqual(false);
    });

    expect(result.current[0].data).toStrictEqual(SUCCESS_RESPONSE);

    expect(result.current[1].data).toStrictEqual(SUCCESS_RESPONSE);
  });

  it('useQueries should handle failure', async () => {
    api.mockResolvedValue(ERROR_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQueries({
          queries: [
            {
              queryKey: ['posts', '1'],
              params: {
                id: '1',
              },
              retry: false,
            },
            {
              queryKey: ['posts', '2'],
              params: {
                id: '2',
              },
              retry: false,
            },
          ],
        }),
      {
        wrapper,
      },
    );

    expect(result.current[0].data).toStrictEqual(undefined);

    expect(result.current[0].isLoading).toStrictEqual(true);

    expect(result.current[1].data).toStrictEqual(undefined);

    expect(result.current[1].isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/2',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current[0].failureCount).toStrictEqual(1);
    });

    await waitFor(() => {
      expect(result.current[1].failureCount).toStrictEqual(1);
    });

    expect(result.current[0].data).toStrictEqual(undefined);
    expect(result.current[0].error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current[0].error!.status).toStrictEqual(503);

    expect(result.current[1].data).toStrictEqual(undefined);
    expect(result.current[1].error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current[1].error!.status).toStrictEqual(503);
  });

  it('useQueries should handle failure', async () => {
    api.mockResolvedValue(ERROR_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQueries({
          queries: [
            {
              queryKey: ['posts', '1'],
              params: {
                id: '1',
              },
              retry: false,
            },
            {
              queryKey: ['posts', '2'],
              params: {
                id: '2',
              },
              retry: false,
            },
          ],
        }),
      {
        wrapper,
      },
    );

    expect(result.current[0].data).toStrictEqual(undefined);

    expect(result.current[0].isLoading).toStrictEqual(true);

    expect(result.current[1].data).toStrictEqual(undefined);

    expect(result.current[1].isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/2',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current[0].failureCount).toStrictEqual(1);
    });

    await waitFor(() => {
      expect(result.current[1].failureCount).toStrictEqual(1);
    });

    expect(result.current[0].data).toStrictEqual(undefined);
    expect(result.current[0].error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current[0].error!.status).toStrictEqual(503);

    expect(result.current[1].data).toStrictEqual(undefined);
    expect(result.current[1].error).toStrictEqual(ERROR_RESPONSE);
    expect(result.current[1].error!.status).toStrictEqual(503);
  });

  it('useQueries should handle connection failure', async () => {
    api.mockImplementation(() => {
      throw new TypeError();
    });

    const { result } = renderHook(
      () =>
        clientWithThrownErrors.posts.getPost.useQueries({
          queries: [
            {
              queryKey: ['posts', '1'],
              params: {
                id: '1',
              },
              retry: false,
            },
            {
              queryKey: ['posts', '2'],
              params: {
                id: '2',
              },
              retry: false,
            },
          ],
        }),
      {
        wrapper,
      },
    );

    expect(result.current[0].data).toStrictEqual(undefined);

    expect(result.current[0].isLoading).toStrictEqual(true);

    expect(result.current[1].data).toStrictEqual(undefined);

    expect(result.current[1].isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/2',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current[0].failureCount).toStrictEqual(1);
    });

    await waitFor(() => {
      expect(result.current[1].failureCount).toStrictEqual(1);
    });

    expect(result.current[0].data).toStrictEqual(undefined);
    expect(result.current[0].error).toBeInstanceOf(TypeError);

    // @ts-expect-error - error might be an exception - so not guaranteed to have a status property
    expect(result.current[0].error!.status).toStrictEqual(undefined);

    expect(result.current[1].data).toStrictEqual(undefined);
    expect(result.current[1].error).toBeInstanceOf(TypeError);

    // @ts-expect-error - error might be an exception - so not guaranteed to have a status property
    expect(result.current[1].error!.status).toStrictEqual(undefined);
  });

  it('useQueries should handle success and failure', async () => {
    api
      .mockResolvedValueOnce(SUCCESS_RESPONSE)
      .mockResolvedValueOnce(ERROR_RESPONSE);

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQueries({
          queries: [
            {
              queryKey: ['posts', '1'],
              params: {
                id: '1',
              },
              retry: false,
            },
            {
              queryKey: ['posts', '2'],
              params: {
                id: '2',
              },
              retry: false,
            },
          ],
        }),
      {
        wrapper,
      },
    );

    expect(result.current[0].data).toStrictEqual(undefined);

    expect(result.current[0].isLoading).toStrictEqual(true);

    expect(result.current[1].data).toStrictEqual(undefined);

    expect(result.current[1].isLoading).toStrictEqual(true);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/2',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });

    await waitFor(() => {
      expect(result.current[0].isLoading).toStrictEqual(false);
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toStrictEqual(false);
    });

    expect(result.current[0].data).toStrictEqual(SUCCESS_RESPONSE);

    expect(result.current[1].data).toStrictEqual(undefined);
    expect(result.current[1].error).toStrictEqual(ERROR_RESPONSE);
  });

  it('fetchQuery should handle success', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    renderHook(
      () => {
        const queryClient = useQueryClient();
        return client.posts.getPost.fetchQuery(queryClient, ['post', '1'], {
          params: {
            id: '1',
          },
        });
      },
      {
        wrapper,
      },
    );

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('fetchQuery should handle success hook', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    renderHook(
      () => {
        const apiQueryClient = useTsRestQueryClient(client);
        return apiQueryClient.posts.getPost.fetchQuery(['post', '1'], {
          params: {
            id: '1',
          },
        });
      },
      {
        wrapper,
      },
    );

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('fetchQuery should handle failure', async () => {
    api.mockResolvedValue(ERROR_RESPONSE);

    const { result } = renderHook(
      async () => {
        const apiQueryClient = useTsRestQueryClient(client);
        try {
          return await apiQueryClient.posts.getPost.fetchQuery(['post', '1'], {
            params: {
              id: '1',
            },
          });
        } catch (error) {
          return error;
        }
      },
      {
        wrapper,
      },
    );

    expect(result.current).resolves.toStrictEqual(ERROR_RESPONSE);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('prefetchQuery should handle success', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    renderHook(
      () => {
        const apiQueryClient = useTsRestQueryClient(client);
        return apiQueryClient.posts.getPost.prefetchQuery(['post', '1'], {
          params: {
            id: '1',
          },
        });
      },
      {
        wrapper,
      },
    );

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('getQueryData should return already fetched data', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    renderHook(
      () => {
        const { data } = client.posts.getPost.useQuery(['post', '1'], {
          params: {
            id: '1',
          },
        });

        return data;
      },
      {
        wrapper,
      },
    );

    await waitFor(() => expect(api).toHaveBeenCalledTimes(1));

    const { result } = renderHook(
      () => {
        const apiQueryClient = useTsRestQueryClient(client);
        return apiQueryClient.posts.getPost.getQueryData(['post', '1']);
      },
      {
        wrapper,
      },
    );

    expect(result.current).toStrictEqual(SUCCESS_RESPONSE);

    expect(api).toHaveBeenCalledTimes(1);

    expect(api).toHaveBeenCalledWith({
      method: 'GET',
      path: 'https://api.com/posts/1',
      body: undefined,
      headers: {
        'x-test': 'test',
      },
      route: router.posts.getPost,
      signal: expect.any(AbortSignal),
      fetchOptions: {
        signal: expect.any(AbortSignal),
      },
    });
  });

  it('setQueryData should overwrite data returned from api', async () => {
    api.mockResolvedValue(SUCCESS_RESPONSE);

    const data = {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: {
        id: '1',
        title: 'foo',
        description: 'bar',
        authorId: '1',
        content: 'baz',
        published: true,
      } as Post,
    } as const;

    renderHook(
      () =>
        client.posts.getPost.useQuery(
          ['post', '1'],
          {
            params: {
              id: '1',
            },
          },
          {
            staleTime: 10000,
          },
        ),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(api).toHaveBeenCalledTimes(1));

    renderHook(
      () => {
        const apiQueryClient = useTsRestQueryClient(client);
        return apiQueryClient.posts.getPost.setQueryData(['post', '1'], data);
      },
      {
        wrapper,
      },
    );

    const { result } = renderHook(
      () =>
        client.posts.getPost.useQuery(
          ['post', '1'],
          {
            params: {
              id: '1',
            },
          },
          {
            staleTime: 10000,
          },
        ),
      {
        wrapper,
      },
    );

    return waitFor(() => {
      expect(result.current.isLoading).toStrictEqual(false);
      expect(result.current.data).toStrictEqual(data);
    });
  });
});
