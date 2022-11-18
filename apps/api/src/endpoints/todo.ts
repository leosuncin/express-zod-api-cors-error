import { defaultEndpointsFactory } from 'express-zod-api';

import { container, TASK_SERVICE_TOKEN } from '~app/container';
import { createTodo, todo } from '~app/schemas/task';

export const createTodoEndpoint = defaultEndpointsFactory.build({
  method: 'post',
  input: createTodo,
  output: todo,
  async handler({ input }) {
    return container.get(TASK_SERVICE_TOKEN).createOne(input);
  },
});
