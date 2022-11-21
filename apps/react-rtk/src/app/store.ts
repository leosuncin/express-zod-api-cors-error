import {
  configureStore,
  ThunkAction,
  Action,
  PreloadedState,
} from '@reduxjs/toolkit';

import { todoSlice } from '../todo/todo.slice';

export const makeStore = (
  preloadedState?: PreloadedState<{
    [todoSlice.name]: ReturnType<typeof todoSlice.reducer>;
  }>,
) => {
  return configureStore({
    preloadedState,
    reducer: {
      [todoSlice.name]: todoSlice.reducer,
    },
  });
};

export const store = makeStore();

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
