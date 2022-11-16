import { createHttpError, defaultEndpointsFactory, z } from 'express-zod-api';
import { sql } from 'slonik';

import { container, POOL_TOKEN } from '~app/container';

export const healthCheckEndpoint = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({
    database: z.object({
      status: z.literal('up'),
    }),
  }),
  async handler() {
    const pool = container.get(POOL_TOKEN);
    try {
      const status = await pool.oneFirst(
        sql.type(z.object({ status: z.literal('up') }))`SELECT 'up' AS status`,
      );

      return {
        database: { status },
      };
    } catch (error) {
      throw createHttpError(503, {
        expose: true,
        message: {
          status: 'down',
          reason: 'database',
        },
      });
    }
  },
});
