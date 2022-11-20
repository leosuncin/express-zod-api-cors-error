export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export type CreateTodo = Pick<Todo, 'title'> & Partial<Pick<Todo, 'order'>>;

export type UpdateTodo =
  | Pick<Todo, 'title'>
  | Pick<Todo, 'completed'>
  | Pick<Todo, 'order'>;

export enum Filter {
  ALL_TODOS = 'all',
  ACTIVE_TODOS = 'active',
  COMPLETED_TODOS = 'completed',
}
