import { createHttpError, defaultEndpointsFactory, z } from 'express-zod-api';
import { NotFoundError } from 'slonik';

import { container, TASK_SERVICE_TOKEN } from '~app/container';
import { createTodo, Todo, todo } from '~app/schemas/task';

export const createTodoEndpoint = defaultEndpointsFactory.build({
  method: 'post',
  input: createTodo,
  output: todo,
  async handler({ input }) {
    return container.get(TASK_SERVICE_TOKEN).createOne(input);
  },
});

export const listAllTodoEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ todos: z.array(todo) }),
  async handler() {
    let todos: Array<Todo> = [];
    try {
      todos = (await container
        .get(TASK_SERVICE_TOKEN)
        .listAll()) as unknown as Array<Todo>;
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    } finally {
      return { todos };
    }
  },
});

export const getOneTodoEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: todo.pick({ id: true }),
  output: todo,
  async handler({ input }) {
    const todo = await container.get(TASK_SERVICE_TOKEN).getOne(input.id);

    if (!todo) {
      throw createHttpError(404, `Not found any todo with id: ${input.id}`);
    }

    return todo;
  },
});
