import { expect, test } from '@playwright/test';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}
type ApiResponse<Data extends object> =
  | {
      status: 'success';
      data: Data;
    }
  | {
      status: 'error';
      error: {
        message: string;
      };
    };

function buildResponseData<Data extends object>(data: Data): ApiResponse<Data> {
  return {
    status: 'success',
    data,
  };
}

function buildResponseError(message: string): ApiResponse<never> {
  return {
    status: 'error',
    error: { message },
  };
}

function handleResponse<Data extends object>(
  response: ApiResponse<Data>,
): Data {
  if (response.status === 'error') {
    throw new Error(response.error.message);
  }

  return response.data;
}

const todoMatcher = {
  id: expect.any(String),
  completed: expect.any(Boolean),
  order: expect.any(Number),
  title: expect.any(String),
};

test.describe('TodoMVC API', () => {
  test.describe('POST /todo', () => {
    test('create a new todo', async ({ request }) => {
      const data = { title: 'Do something' };
      const response = await request.post('/todo', { data });

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({
          id: expect.any(String),
          completed: false,
          order: expect.any(Number),
          title: data.title,
        }),
      );
    });

    test('validate the request data', async ({ request }) => {
      const response = await request.post('/todo');

      expect(response.status()).toBe(400);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseError('title: Required'),
      );
    });
  });

  test.describe('GET /todo', () => {
    test('list all of the todos', async ({ request }) => {
      await request.post('/todo', { data: { title: 'Get me' } });
      const response = await request.get('/todo');

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({
          todos: expect.arrayContaining([expect.objectContaining(todoMatcher)]),
        }),
      );
    });
  });

  test.describe('GET /todo/:id', () => {
    let todo: Todo;

    test.beforeEach(async ({ request }) => {
      const response = await request.post('/todo', {
        data: { title: 'Get me' },
      });
      todo = handleResponse(await response.json());
    });

    test('get one todo by id', async ({ request }) => {
      const response = await request.get(`/todo/${todo.id}`);

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({ ...todo, completed: expect.any(Boolean) }),
      );
    });

    test('fail when the todo is not found', async ({ request }) => {
      const response = await request.get(
        '/todo/038c71e2-b450-4d6a-b4df-7bf8ce05b369',
      );

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseError(
          `Not found any todo with id: 038c71e2-b450-4d6a-b4df-7bf8ce05b369`,
        ),
      );
    });
  });

  test.describe('PUT /todo/:id', () => {
    let todo: Todo;

    test.beforeEach(async ({ request }) => {
      const response = await request.post('/todo', {
        data: { title: 'Change me' },
      });
      todo = handleResponse(await response.json());
    });

    test('should update one existing todo by id', async ({ request }) => {
      const response = await request.put(`/todo/${todo.id}`, {
        data: { title: 'Change my mind' },
      });

      expect(response.ok()).toBe(true);
      expect(response.json()).resolves.toMatchObject(
        buildResponseData({
          ...todo,
          title: 'Change my mind',
          completed: expect.any(Boolean),
        }),
      );
    });

    test('fail when the todo is not found', async ({ request }) => {
      const response = await request.put(
        '/todo/dedb85ae-11b9-4481-8235-b8d8094b6dda',
      );

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseError(
          `Not found any todo with id: dedb85ae-11b9-4481-8235-b8d8094b6dda`,
        ),
      );
    });

    test('validate the request data', async ({ request }) => {
      const response = await request.put(`/todo/${todo.id}`, {
        data: { completed: 'no', order: '2', title: false },
      });

      expect(response.status()).toBe(400);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseError(
          'completed: Expected boolean, received string; order: Expected number, received string; title: Expected string, received boolean',
        ),
      );
    });
  });

  test.describe('DELETE /todo/:id', () => {
    let todo: Todo;

    test.beforeEach(async ({ request }) => {
      const response = await request.post('/todo', {
        data: { title: 'Delete me' },
      });
      todo = handleResponse(await response.json());
    });

    test('remove one existing todo by id', async ({ request }) => {
      const response = await request.delete(`/todo/${todo.id}`);

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({ ...todo, completed: expect.any(Boolean) }),
      );
    });

    test('fail when the todo is not found', async ({ request }) => {
      const response = await request.delete(
        '/todo/fcdd4f8f-d524-48f2-87e9-4f5c3f616dfa',
      );

      expect(response.status()).toBe(404);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseError(
          `Not found any todo with id: fcdd4f8f-d524-48f2-87e9-4f5c3f616dfa`,
        ),
      );
    });
  });

  test.describe('PATCH /todo', () => {
    test('toggle all of the todos', async ({ request }) => {
      const response = await request.patch('/todo', { data: {} });

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({
          todos: expect.arrayContaining([expect.objectContaining(todoMatcher)]),
        }),
      );
    });
  });

  test.describe('DELETE /todo', () => {
    test('remove all of the todos by their ids', async ({ request }) => {
      const { todos } = handleResponse<{ todos: Todo[] }>(
        await (await request.get('/todo')).json(),
      );
      const query = new URLSearchParams();
      todos.forEach((todo) => {
        if (todo.completed) {
          query.append('ids', todo.id);
        }
      });
      const response = await request.delete(`/todo?${query.toString()}`);

      expect(response.ok()).toBe(true);
      await expect(response.json()).resolves.toMatchObject(
        buildResponseData({
          todos: expect.arrayContaining([expect.objectContaining(todoMatcher)]),
        }),
      );
    });
  });
});
