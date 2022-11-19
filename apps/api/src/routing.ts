import { DependsOnMethod, type Routing } from 'express-zod-api';

import { healthCheckEndpoint } from '~app/endpoints/health';
import {
  createTodoEndpoint,
  getOneTodoEndpoint,
  listAllTodoEndpoint,
  removeAllTodoEndpoint,
  removeOneTodoEndpoint,
  toggleAllTodoEndpoint,
  updateOneTodoEndpoint,
} from '~app/endpoints/todo';

export const routing: Routing = {
  health: healthCheckEndpoint,
  todo: {
    '': new DependsOnMethod({
      post: createTodoEndpoint,
      get: listAllTodoEndpoint,
      put: toggleAllTodoEndpoint,
      delete: removeAllTodoEndpoint,
    }),
    ':id': new DependsOnMethod({
      get: getOneTodoEndpoint,
      put: updateOneTodoEndpoint,
      delete: removeOneTodoEndpoint,
    }),
  },
};
