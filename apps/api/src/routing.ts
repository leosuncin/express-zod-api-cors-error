import { DependsOnMethod, type Routing } from 'express-zod-api';

import { healthCheckEndpoint } from '~app/endpoints/health';
import { createTodoEndpoint, listAllTodoEndpoint } from '~app/endpoints/todo';

export const routing: Routing = {
  health: healthCheckEndpoint,
  todo: new DependsOnMethod({
    post: createTodoEndpoint,
    get: listAllTodoEndpoint,
  }),
};
