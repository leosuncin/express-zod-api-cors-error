import { createServer } from 'express-zod-api';
import { createPool } from 'slonik';

import { config, env } from '~app/config';
import { container, POOL_TOKEN } from '~app/container';
import { routing } from '~app/routing';

export async function bootstrap() {
  const pool = await createPool(env.DATABASE_URL);

  container.bind(POOL_TOKEN).toConstant(pool);

  return createServer(config, routing);
}

if (require.main === module) {
  bootstrap().catch(console.error);
}
