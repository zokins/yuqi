import { ClientInferResponseBody } from '@ts-rest/core';
import type { testContract } from '../../contracts/test-contract';

type TestData = ClientInferResponseBody<typeof testContract.test, 200>;

export function DataComponent({ data }: { data: TestData }) {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <ul role="list" className="divide-y divide-gray-100 w-80">
        <li className="flex gap-x-4 py-5">
          <div className="flex-auto">
            <div className="flex items-baseline justify-between gap-x-4">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                ID
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
              {data.id}
            </p>
          </div>
        </li>
        <li className="flex gap-x-4 py-5">
          <div className="flex-auto">
            <div className="flex items-baseline justify-between gap-x-4">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Foo
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
              {data.foo}
            </p>
          </div>
        </li>
        <li className="flex gap-x-4 py-5">
          <div className="flex-auto">
            <div className="flex items-baseline justify-between gap-x-4">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Bar
              </p>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-600">
              {data.bar}
            </p>
          </div>
        </li>
      </ul>
    </main>
  );
}
