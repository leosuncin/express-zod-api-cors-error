import { DependsOnMethod, type Routing } from 'express-zod-api';

import { healthCheckEndpoint } from '~app/endpoints/health';
import {
  createTodoEndpoint,
  getOneTodoEndpoint,
  listAllTodoEndpoint,
  removeOneTodoEndpoint,
  updateOneTodoEndpoint,
} from '~app/endpoints/todo';

export const routing: Routing = {
  health: healthCheckEndpoint,
  todo: {
    '': new DependsOnMethod({
      post: createTodoEndpoint,
      get: listAllTodoEndpoint,
    }),
    ':id': new DependsOnMethod({
      get: getOneTodoEndpoint,
      put: updateOneTodoEndpoint,
      delete: removeOneTodoEndpoint,
    }),
  },
};
