import type { Routing } from 'express-zod-api';

import { healthCheckEndpoint } from '~app/endpoints/health';
import { createTodoEndpoint } from '~app/endpoints/todo';

export const routing: Routing = {
  health: healthCheckEndpoint,
  todo: createTodoEndpoint,
};
