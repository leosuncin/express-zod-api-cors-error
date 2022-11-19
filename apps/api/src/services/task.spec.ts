import { randomUUID } from 'node:crypto';
import { createMockPool, createMockQueryResult, DatabasePool } from 'slonik';

import { TaskService } from '~app/services/task';

describe('TaskService', () => {
  let pool: DatabasePool;
  let service: TaskService;

  beforeAll(() => {
    pool = createMockPool({
      async query(sql, values) {
        if (/INSERT/iu.test(sql)) {
          return createMockQueryResult([
            {
              id: randomUUID(),
              title: values[0] as string,
              completed: false,
              order: values[1] ?? 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]);
        }

        if (/SELECT */.test(sql)) {
          return createMockQueryResult([
            {
              id: values[0] ?? randomUUID(),
              title: 'Do something',
              completed: false,
              order: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]);
        }

        if (/UPDATE/.test(sql)) {
          return createMockQueryResult([
            {
              id: values[1] as string,
              title: typeof values[0] === 'string' ? values[0] : '',
              completed: typeof values[0] === 'boolean' ? values[0] : false,
              order: typeof values[0] === 'number' ? values[0] : 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]);
        }

        if (/DELETE/.test(sql)) {
          return createMockQueryResult([
            {
              id: values[0] as string,
              title: 'Remove me',
              completed: true,
              order: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]);
        }

        return createMockQueryResult([]);
      },
    });
    service = new TaskService(pool);
  });

  it.each([
    { title: 'Make a sandwich' },
    { title: 'Make a sandwich', order: 2 },
  ])('should create a new task with %j', async (newTask) => {
    const task = await service.createOne(newTask);

    expect(task).toMatchObject(newTask);
  });

  it('should list all of the tasks', async () => {
    const tasks = await service.listAll();

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('should get one task by its id', async () => {
    const id = randomUUID();
    const task = await service.getOne(id);

    expect(task).toBeDefined();
    expect(task).toHaveProperty('id', id);
  });

  it.each([{ completed: true }, { title: 'Do something else' }, { order: 3 }])(
    'should update one existing task by its id with %j',
    async (changes) => {
      const id = randomUUID();
      const task = await service.updateOne(id, changes);

      expect(task).toBeDefined();
      expect(task).toHaveProperty('id', id);
      expect(task).toHaveProperty(
        Object.keys(changes)[0] as string,
        Object.values(changes)[0],
      );
    },
  );

  it('should remove one existing task by its id', async () => {
    const id = randomUUID();
    const task = await service.removeOne(id);

    expect(task).toBeDefined();
    expect(task).toHaveProperty('id', id);
  });

  it.each([undefined, true, false])(
    'should toggle completed (%p) of all of the tasks',
    async (completed) => {
      const tasks = await service.toggleAll(completed);

      expect(Array.isArray(tasks)).toBe(true);
    },
  );
});
