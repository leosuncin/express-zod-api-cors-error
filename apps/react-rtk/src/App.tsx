import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from './app/hooks';
import Footer from './todo/Footer';
import Header from './todo/Header';
import {
  listTodos,
  selectActiveCount,
  selectAllCount,
  selectCompletedCount,
} from './todo/todo.slice';
import TodoList from './todo/TodoList';

function TodoMvc() {
  const allCount = useAppSelector(selectAllCount);
  const activeCount = useAppSelector(selectActiveCount);
  const completedCount = useAppSelector(selectCompletedCount);
  const dispatch = useAppDispatch();
  const showTodoList = allCount > 0;
  const showFooter = activeCount > 0 || completedCount > 0;

  useEffect(() => {
    const promise = dispatch(listTodos());

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  return (
    <div className="todoapp">
      <Header />
      {showTodoList ? <TodoList /> : null}
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export default TodoMvc;
