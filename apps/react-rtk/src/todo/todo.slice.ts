import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';

import { AppThunk, RootState } from '../app/store';
import { type Todo, Filter } from './todo.interface';
import * as client from './todo.client';

const todoAdapter = createEntityAdapter<Todo>();

const initialState = todoAdapter.getInitialState<{ filter: Filter }>({
  filter: Filter.ALL_TODOS,
});

const todoSelectors = todoAdapter.getSelectors(
  (state: RootState) => state.todo,
);

export const createTodo = createAsyncThunk(
  'todo/createTodo',
  client.createTodo,
);

export const listTodos = createAsyncThunk('todo/listTodos', client.listTodos);

export const updateTodo = createAsyncThunk(
  'todo/updateTodo',
  client.updateTodo,
);

export const toggleTodos = createAsyncThunk(
  'todo/toggleTodos',
  client.toggleTodos,
);

export const deleteTodo = createAsyncThunk(
  'todo/deleteTodo',
  client.deleteTodo,
);

export const removeTodos = createAsyncThunk(
  'todo/removeTodos',
  client.removeTodos,
);

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    changeFilter(state, action: PayloadAction<Filter>) {
      state.filter = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(createTodo.fulfilled, todoAdapter.addOne);

    builder.addCase(listTodos.fulfilled, todoAdapter.addMany);

    builder.addCase(updateTodo.fulfilled, todoAdapter.setOne);

    builder.addCase(toggleTodos.fulfilled, todoAdapter.setMany);

    builder.addCase(deleteTodo.fulfilled, (state, action) => {
      todoAdapter.removeOne(state, action.payload.id);
    });

    builder.addCase(removeTodos.fulfilled, (state, action) => {
      todoAdapter.removeMany(
        state,
        action.payload.map(({ id }) => id),
      );
    });
  },
});

export const { changeFilter } = todoSlice.actions;

export const clearCompleted = (): AppThunk => (dispatch, getState) => {
  const todosCompleted = todoSelectors
    .selectAll(getState())
    .filter((todo) => todo.completed)
    .map((todo) => todo.id);

  return dispatch(removeTodos(todosCompleted));
};

export const selectFilter = (state: RootState) => state.todo.filter;

export const selectActiveCount = createSelector(
  todoSelectors.selectAll,
  (todos) =>
    todos.reduce((count, todo) => (todo.completed ? count : count + 1), 0),
);

export const selectCompletedCount = createSelector(
  todoSelectors.selectAll,
  selectActiveCount,
  (todos, activeCount) => todos.length - activeCount,
);

export const selectAllCount = (state: RootState) =>
  todoSelectors.selectAll(state).length;

export const selectTodos = createSelector(
  selectFilter,
  todoSelectors.selectAll,
  (filter, todos) =>
    todos.filter((todo) => {
      switch (filter) {
        case Filter.ACTIVE_TODOS:
          return !todo.completed;
        case Filter.COMPLETED_TODOS:
          return todo.completed;
        default:
          return true;
      }
    }),
);
