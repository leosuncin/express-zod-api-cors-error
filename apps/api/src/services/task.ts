import { injected } from 'brandi';
import { createSqlTag, type DatabasePool } from 'slonik';

import { POOL_TOKEN } from '~app/container';
import { CreateTask, EditTodo, Task, task } from '~app/schemas/task';

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

  updateOne(
    id: Task['id'],
    changes: Omit<EditTodo, 'id'>,
  ): Promise<Task | null> {
    return this.pool.connect((connection) =>
      connection.maybeOne(
        sql.typeAlias('task')`UPDATE tasks SET ${sql.join(
          Object.entries(changes).map(
            ([key, value]) =>
              sql.fragment`${sql.identifier([key])} = ${
                value as string | number | boolean
              }`,
          ),
          sql.fragment`,`,
        )}, updated_at = NOW() WHERE id = ${id} AND ${sql.join(
          Object.entries(changes).map(
            ([key, value]) =>
              sql.fragment`${sql.identifier([key])} IS DISTINCT FROM ${
                value as string | number | boolean
              }`,
          ),
          sql.fragment` OR `,
        )} RETURNING *`,
      ),
    );
  }

  removeOne(id: Task['id']): Promise<Task | null> {
    return this.pool.connect((connection) =>
      connection.maybeOne(
        sql.typeAlias('task')`DELETE FROM tasks WHERE id = ${id} RETURNING *`,
      ),
    );
  }

  toggleAll(completed?: Task['completed']): Promise<ArrayLike<Task>> {
    return this.pool.connect((connection) =>
      connection.many(
        sql.typeAlias('task')`UPDATE tasks SET completed = ${
          typeof completed === 'boolean'
            ? completed
            : sql.fragment`NOT(completed)`
        }, updated_at = NOW() ${
          typeof completed === 'boolean'
            ? sql.fragment`WHERE completed IS DISTINCT FROM ${completed}`
            : sql.fragment``
        } RETURNING *`,
      ),
    );
  }

  removeAll(ids?: Array<Task['id']>): Promise<ArrayLike<Task>> {
    return this.pool.connect(async (connection) => {
      const tasks = await connection.many(
        sql.typeAlias('task')`DELETE FROM tasks ${
          Array.isArray(ids) && ids.length > 0
            ? sql.fragment`WHERE id = ANY(${sql.array(ids, 'uuid')})`
            : sql.fragment``
        } RETURNING *`,
      );

      return tasks;
    });
  }
}

injected(TaskService, POOL_TOKEN);
