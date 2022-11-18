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
});
