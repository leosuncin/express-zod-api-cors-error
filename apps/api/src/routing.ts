import type { Routing } from 'express-zod-api';

import { healthCheckEndpoint } from '~app/endpoints/health';

export const routing: Routing = {
  health: healthCheckEndpoint,
};
