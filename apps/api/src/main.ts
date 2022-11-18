import { createServer } from 'express-zod-api';
import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import { config, env } from '~app/config';
import { container, POOL_TOKEN, TASK_SERVICE_TOKEN } from '~app/container';
import { routing } from '~app/routing';
import { TaskService } from '~app/services/task';

export async function bootstrap() {
  const pool = await createPool(env.DATABASE_URL, {
    interceptors: createInterceptors(),
  });

  container.bind(POOL_TOKEN).toConstant(pool);
  container.bind(TASK_SERVICE_TOKEN).toInstance(TaskService).inSingletonScope();

  return createServer(config, routing);
}

if (require.main === module) {
  bootstrap().catch(console.error);
}
