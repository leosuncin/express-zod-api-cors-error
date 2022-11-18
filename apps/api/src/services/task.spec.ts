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
              title: values.at(0) as string,
              completed: false,
              order: values.at(1) ?? 1,
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
});
