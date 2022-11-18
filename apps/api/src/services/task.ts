import { injected } from 'brandi';
import { createSqlTag, type DatabasePool } from 'slonik';

import { POOL_TOKEN } from '~app/container';
import { CreateTask, Task, task } from '~app/schemas/task';

const sql = createSqlTag({
  typeAliases: { task },
});

export class TaskService {
  constructor(private readonly pool: DatabasePool) {}

  createOne(newTask: CreateTask): Promise<Task> {
    return this.pool.connect((connection) =>
      connection.one(
        sql.typeAlias('task')`INSERT INTO tasks (${sql.join(
          Object.keys(newTask).map((key) => sql.identifier([key])),
          sql.fragment`, `,
        )}) VALUES (${sql.join(
          Object.values(newTask).map((value) => sql.unsafe`${value!}`),
          sql.fragment`, `,
        )}) RETURNING *`,
      ),
    );
  }

  listAll(): Promise<ArrayLike<Task>> {
    return this.pool.connect((connection) =>
      connection.many(sql.typeAlias('task')`SELECT * FROM tasks`),
    );
  }

  getOne(id: Task['id']): Promise<Task | null> {
    return this.pool.connect((connection) =>
      connection.maybeOne(
        sql.typeAlias('task')`SELECT * FROM tasks WHERE id = ${id}`,
      ),
    );
  }
}

injected(TaskService, POOL_TOKEN);
