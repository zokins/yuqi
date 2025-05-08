<p align="center">
 <img src="assets/yuqi.png" height="100"></img>
</p>

<p align="center">REST API's made magical 🪄</p>

<p align="center">
  <a href="https://github.com/zokins/yuqi">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/zokins/yuqi"/>
  </a>
  <a href="https://www.npmjs.com/package/@yuqijs/core">
    <img src="https://img.shields.io/npm/dm/%40yuqijs/core"/>
  </a>
  <a href="https://github.com/zokins/yuqi/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/zokins/yuqi"/>
  </a>
  <a href="https://bundlephobia.com/package/@yuqijs/core">
    <img alt="Bundle Size" src="https://img.shields.io/bundlephobia/minzip/@yuqijs/core?label=%40yuqijs%2Fcore"/>
  </a>
</p>

# Introduction

Yuqi offers a simple way to define a contract for your API, which can be both consumed and implemented by your application, giving you end to end type safety without the hassle or code generation.

### Features

- End-to-end type safety 🛟
- RPC-like client side API ⚡️
- Small Bundle Size 📉
- No Code Generation 🏃‍♀️
- Zod support for runtime validation 🔒
- Full optional OpenAPI integration 📝

### Super Simple Example

Easily define your API contract somewhere shared

```typescript
const contract = c.router({
  getPosts: {
    method: "GET",
    path: "/posts",
    query: z.object({
      skip: z.number(),
      take: z.number(),
    }), // <-- Zod schema
    responses: {
      200: c.type<Post[]>(), // <-- OR normal TS types
    },
    headers: z.object({
      "x-pagination-page": z.coerce.number().optional(),
    }),
  },
});
```

Fulfill the contract on your server, with a type-safe router:

```typescript
const router = s.router(contract, {
  getPosts: async ({ params: { id } }) => {
    return {
      status: 200,
      body: prisma.post.findUnique({ where: { id } }),
    };
  },
});
```

Consume the api on the client with a RPC-like interface:

```typescript
const result = await client.getPosts({
  headers: { "x-pagination-page": 1 },
  query: { skip: 0, take: 10 },
  // ^-- Fully typed!
});
```

## Star History

<div align="center">
<a href="https://star-history.com/#zokins/yuqi&Timeline">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zokins/yuqi&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zokins/yuqi&type=Timeline" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zokins/yuqi&type=Timeline" />
  </picture>
</a>
</div>
