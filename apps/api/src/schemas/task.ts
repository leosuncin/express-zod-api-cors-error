import { z } from 'express-zod-api';

export const task = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  completed: z.boolean().default(false),
  order: z.number().positive(),
  createdAt: z.dateOut(),
  updatedAt: z.dateOut(),
});

export const todo = task.omit({ createdAt: true, updatedAt: true });

export const createTodo = task
  .pick({ title: true })
  .merge(task.pick({ order: true }).partial());

export type Task = z.infer<typeof task>;

export type Todo = z.infer<typeof todo>;

export type CreateTask = z.infer<typeof createTodo>;
