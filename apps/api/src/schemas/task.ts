import { z } from 'express-zod-api';

export const task = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  completed: z.boolean().default(false),
  order: z.number().positive(),
  createdAt: z.preprocess(
    (timestamp) => new Date(z.number().parse(timestamp)),
    z.dateOut(),
  ),
  updatedAt: z.preprocess(
    (timestamp) => new Date(z.number().parse(timestamp)),
    z.dateOut(),
  ),
});

export const todo = task.omit({ createdAt: true, updatedAt: true });

export const createTodo = task
  .pick({ title: true })
  .merge(task.pick({ order: true }).partial());

export const editTodo = task.pick({ id: true }).merge(
  task
    .pick({
      completed: true,
      order: true,
      title: true,
    })
    .partial(),
);

export const toggleTodo = task.pick({ completed: true }).partial();

export const idsTodo = z.object({
  ids: z.array(z.string().trim().uuid()).optional(),
});

export type Task = z.infer<typeof task>;

export type Todo = z.infer<typeof todo>;

export type CreateTask = z.infer<typeof createTodo>;

export type EditTodo = z.infer<typeof editTodo>;
