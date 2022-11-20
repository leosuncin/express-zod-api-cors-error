import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { testEndpoint } from 'express-zod-api';
import migrate from 'node-pg-migrate';
import { DataType, type ISubscription, newDb, type IBackup } from 'pg-mem';

import { container, POOL_TOKEN, TASK_SERVICE_TOKEN } from '~app/container';
import {
  createTodoEndpoint,
  getOneTodoEndpoint,
  listAllTodoEndpoint,
  removeAllTodoEndpoint,
  removeOneTodoEndpoint,
  toggleAllTodoEndpoint,
  updateOneTodoEndpoint,
} from '~app/endpoints/todo';
import { TaskService } from '~app/services/task';
import type { Task } from '~app/schemas/task';

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

  describe('GET /todo', () => {
    it('returns an empty array when there is none', async () => {
      const { responseMock } = await testEndpoint({
        endpoint: listAllTodoEndpoint,
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          todos: [],
        },
      });
    });

    it('returns all of the todos', async () => {
      const task: Task = db.public
        .getTable('tasks')
        .insert({ title: 'Just do it' });

      const { responseMock } = await testEndpoint({
        endpoint: listAllTodoEndpoint,
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          todos: [
            {
              id: task.id,
              title: task.title,
              completed: task.completed,
              order: task.order,
            },
          ],
        },
      });
    });
  });

  describe('GET /todo/:id', () => {
    let task: Task;

    beforeEach(() => {
      task = db.public.getTable('tasks').insert({ title: 'Just do it' });
    });

    it('gets one todo by id', async () => {
      const { responseMock } = await testEndpoint({
        endpoint: getOneTodoEndpoint,
        requestProps: {
          params: {
            id: task.id,
          },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        data: {
          id: task.id,
          title: task.title,
          completed: task.completed,
          order: task.order,
        },
        status: 'success',
      });
    });

    it('fails when no todo is found', async () => {
      const id = randomUUID();
      const { responseMock } = await testEndpoint({
        endpoint: getOneTodoEndpoint,
        requestProps: {
          params: { id },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(404);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: {
          message: `Not found any todo with id: ${id}`,
        },
        status: 'error',
      });
    });
  });

  describe('PUT /todo/:id', () => {
    let task: Task;
    let subscription: ISubscription;

    beforeEach(() => {
      task = db.public.getTable('tasks').insert({ title: 'Change me' });
      subscription = db.public.interceptQueries((sql) => {
        if (/IS DISTINCT/iu.test(sql)) {
          const result = /SET "(?<column>\w*)"\s+=\s+'(?<value>.*)',/.exec(sql);
          const { column, value } = result!.groups!;
          function safeParse(value: string) {
            try {
              return eval(value);
            } catch {
              return value;
            }
          }

          return [
            { ...task, [column!]: safeParse(value!), updatedAt: Date.now() },
          ];
        }

        return null;
      });
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it.each([
      { completed: true },
      { title: 'Do something else' },
      { order: 3 },
    ])('updates one existing todo by id with %j', async (body) => {
      const { responseMock } = await testEndpoint({
        endpoint: updateOneTodoEndpoint,
        requestProps: {
          method: 'PUT',
          params: { id: task.id },
          body,
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        data: {
          id: task.id,
          title: task.title,
          completed: task.completed,
          order: task.order,
          ...body,
        },
        status: 'success',
      });
    });

    it('fails when no todo is found', async () => {
      const id = randomUUID();
      const { responseMock } = await testEndpoint({
        endpoint: updateOneTodoEndpoint,
        requestProps: {
          method: 'PUT',
          params: { id },
          body: { title: 'Consequat cillum laborum' },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(404);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: {
          message: `Not found any todo with id: ${id}`,
        },
        status: 'error',
      });
    });

    it.each([{ completed: 'no' }, { order: '2' }, { title: false }])(
      'validates the input %j',
      async (body) => {
        const { responseMock } = await testEndpoint({
          endpoint: updateOneTodoEndpoint,
          requestProps: {
            method: 'PUT',
            params: { id: task.id },
            body,
          },
        });

        expect(responseMock.status).toHaveBeenCalledWith(400);
        expect(responseMock.json).toHaveBeenCalledWith({
          status: 'error',
          error: {
            message: expect.stringContaining(Object.keys(body)[0]!),
          },
        });
      },
    );
  });

  describe('DELETE /todo/:id', () => {
    let task: Task;

    beforeEach(() => {
      task = db.public.getTable('tasks').insert({ title: 'Remove me' });
    });

    it('removes one existing todo by id', async () => {
      const { responseMock } = await testEndpoint({
        endpoint: removeOneTodoEndpoint,
        requestProps: {
          method: 'DELETE',
          params: { id: task.id },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        data: {
          id: task.id,
          title: task.title,
          completed: task.completed,
          order: task.order,
        },
        status: 'success',
      });
    });

    it('fails when no todo is found', async () => {
      const id = randomUUID();
      const { responseMock } = await testEndpoint({
        endpoint: removeOneTodoEndpoint,
        requestProps: {
          method: 'DELETE',
          params: { id },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(404);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: {
          message: `Not found any todo with id: ${id}`,
        },
        status: 'error',
      });
    });
  });

  describe('PATCH /todo', () => {
    it("returns an empty array when there isn't any todos to toggle", async () => {
      const { responseMock } = await testEndpoint({
        endpoint: toggleAllTodoEndpoint,
        requestProps: {
          method: 'PATCH',
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          todos: [],
        },
      });
    });

    it.each([undefined, { completed: true }, { completed: false }])(
      'toggles all of the todos with %p',
      async (body) => {
        const pendingTask: Task = db.public
          .getTable('tasks')
          .insert({ title: 'Pending', completed: false });
        const completedTask: Task = db.public
          .getTable('tasks')
          .insert({ title: 'Done', completed: true });
        const subscription = db.public.interceptQueries((sql) => {
          if (/completed = NOT(completed)/.test(sql)) {
            return [
              { ...pendingTask, completed: !pendingTask.completed },
              { ...completedTask, completed: !completedTask.completed },
            ];
          }
          if (/completed = 'true'/.test(sql)) {
            return [{ ...pendingTask, completed: true }];
          }
          if (/completed = 'false'/.test(sql)) {
            return [{ ...completedTask, completed: false }];
          }
          return null;
        });

        const { responseMock } = await testEndpoint({
          endpoint: toggleAllTodoEndpoint,
          requestProps: {
            method: 'PATCH',
            body,
          },
        });
        subscription.unsubscribe();

        expect(responseMock.status).toHaveBeenCalledWith(200);
        expect(responseMock.json).toHaveBeenCalledWith({
          status: 'success',
          data: {
            todos: expect.arrayContaining([
              expect.objectContaining({
                completed: body ? body.completed : expect.any(Boolean),
              }),
            ]),
          },
        });
      },
    );
  });

  describe('DELETE /todo', () => {
    let task: Task;

    beforeEach(() => {
      task = db.public
        .getTable('tasks')
        .insert({ title: 'Amet officia veniam id.' });
    });

    it('remove all of the todos', async () => {
      const { responseMock } = await testEndpoint({
        endpoint: removeAllTodoEndpoint,
        requestProps: {
          method: 'DELETE',
        },
      });
      const { count } = db.public.one('SELECT COUNT(*) FROM tasks');

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          todos: expect.arrayContaining([expect.anything()]),
        },
      });
      expect(count).toBe(0);
    });

    it('should remove only the filtered todos by id', async () => {
      db.public.getTable('tasks').insert({ title: 'Amet est sint amet.' });

      const { responseMock } = await testEndpoint({
        endpoint: removeAllTodoEndpoint,
        requestProps: {
          method: 'DELETE',
          query: {
            ids: [task.id],
          },
        },
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          todos: [],
        },
      });
    });
  });
});
