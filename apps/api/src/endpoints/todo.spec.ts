import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { testEndpoint } from 'express-zod-api';
import migrate from 'node-pg-migrate';
import { DataType, newDb, type IBackup } from 'pg-mem';

import { container, POOL_TOKEN, TASK_SERVICE_TOKEN } from '~app/container';
import { createTodoEndpoint } from '~app/endpoints/todo';
import { TaskService } from '~app/services/task';

const db = newDb();

db.registerExtension('pgcrypto', (schema) => {
  schema.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    impure: true,
    implementation: () => randomUUID(),
  });
});

describe('Todo endpoints', () => {
  let backup: IBackup;

  beforeAll(async () => {
    const pool = db.adapters.createSlonik();
    const { Client } = db.adapters.createPg();
    const dbClient = new Client();

    container.bind(POOL_TOKEN).toConstant(pool);
    container
      .bind(TASK_SERVICE_TOKEN)
      .toInstance(TaskService)
      .inContainerScope();

    await migrate({
      dbClient,
      noLock: true,
      migrationsTable: 'pgmigrations',
      direction: 'up',
      dir: resolve(process.cwd(), 'migrations'),
      log: () => {},
    });
    await dbClient.end();
  });

  beforeEach(() => {
    container.capture?.();
    backup = db.backup();
  });

  afterEach(() => {
    container.restore?.();
    backup.restore();
  });

  describe('POST /todo', () => {
    it.each([
      { title: 'Make a sandwich' },
      { title: 'Make a salad', order: 2 },
    ])('creates a new todo with %j', async (body) => {
      const { responseMock } = await testEndpoint({
        endpoint: createTodoEndpoint,
        requestProps: {
          method: 'POST',
          body,
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: expect.any(String),
          completed: false,
          order: 1,
          ...body,
        },
      });
    });

    it('validates the input', async () => {
      const { responseMock } = await testEndpoint({
        endpoint: createTodoEndpoint,
        requestProps: {
          method: 'POST',
          body: {},
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'error',
        error: {
          message: 'title: Required',
        },
      });
    });
  });
});
