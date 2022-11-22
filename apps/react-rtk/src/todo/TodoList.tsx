import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import type { Todo } from './todo.interface';
import {
  deleteTodo,
  selectActiveCount,
  selectTodos,
  toggleTodos,
  updateTodo,
} from './todo.slice';
import TodoItem from './TodoItem';

function TodoList() {
  const [editing, setEditing] = useState<Todo['id'] | null>(null);
  const todos = useAppSelector(selectTodos);
  const activeCount = useAppSelector(selectActiveCount);
  const dispatch = useAppDispatch();

  function handleEdit(todo: Todo) {
    return () => {
      setEditing(todo.id);
    };
  }

  function handleCancel() {
    setEditing(null);
  }

  function handleSave(todo: Todo) {
    return (text: string) => {
      void dispatch(updateTodo({ id: todo.id, title: text }));
      setEditing(null);
    };
  }

  function handleToggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    const completed = event.target.checked;

    void dispatch(toggleTodos(completed));
  }

  function handleToggle(todo: Todo) {
    return (id: Todo['id']) =>
      dispatch(updateTodo({ id, completed: !todo.completed }));
  }

  return (
    <section className="main">
      <input
        id="toggle-all"
        className="toggle-all"
        type="checkbox"
        checked={activeCount === 0}
        onChange={handleToggleAll}
      />
      <label htmlFor="toggle-all">Toggle all</label>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            editing={editing === todo.id}
            todo={todo}
            onCancel={handleCancel}
            onDestroy={(id) => dispatch(deleteTodo(id))}
            onEdit={handleEdit(todo)}
            onSave={handleSave(todo)}
            onToggle={handleToggle(todo)}
          />
        ))}
      </ul>
    </section>
  );
}

export default TodoList;
