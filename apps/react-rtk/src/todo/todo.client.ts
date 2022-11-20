import type { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { $fetch } from 'ohmyfetch';

import type { Todo, UpdateTodo } from './todo.interface';

type ApiResponse<Data> =
  | {
      status: 'success';
      data: Data;
    }
  | {
      status: 'error';
      error: {
        message: string;
      };
    };

const client = $fetch.create({ baseURL: import.meta.env.VITE_API_URL });

function handleResponse<Data>(response: ApiResponse<Data>): Data {
  if (response.status === 'error') {
    throw new Error(response.error.message);
  }

  return response.data;
}

export const createTodo: AsyncThunkPayloadCreator<Todo, string> = async (
  title,
) => {
  const response = await client<ApiResponse<Todo>>('/todo', {
    method: 'POST',
    body: { title },
  });

  return handleResponse(response);
};

export const listTodos: AsyncThunkPayloadCreator<Todo[]> = async (
  _,
  thunkApi,
) => {
  const response = await client<ApiResponse<{ todos: Todo[] }>>('/todo', {
    signal: thunkApi.signal,
  });

  return handleResponse(response).todos;
};

export const updateTodo: AsyncThunkPayloadCreator<
  Todo,
  UpdateTodo & Pick<Todo, 'id'>
> = async ({ id, ...changes }) => {
  const response = await client<ApiResponse<Todo>>(`/todo/${id}`, {
    method: 'PUT',
    body: changes,
  });

  return handleResponse(response);
};

export const toggleTodos: AsyncThunkPayloadCreator<Todo[], boolean> = async (
  completed,
) => {
  const response = await client<ApiResponse<{ todos: Todo[] }>>('/todo', {
    method: 'PATCH',
    body: { completed },
  });

  return handleResponse(response).todos;
};

export const deleteTodo: AsyncThunkPayloadCreator<Todo, Todo['id']> = async (
  id,
) => {
  const response = await client<ApiResponse<Todo>>(`/todo/${id}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
};

export const removeTodos: AsyncThunkPayloadCreator<
  Array<Todo>,
  Array<Todo['id']> | undefined
> = async (ids) => {
  const response = await client<ApiResponse<{ todos: Array<Todo> }>>('/todo', {
    method: 'DELETE',
    query: { 'ids[]': ids },
  });

  return handleResponse(response).todos;
};
