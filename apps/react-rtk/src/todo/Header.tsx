import React, { useState } from 'react';

import { useAppDispatch } from '../app/hooks';
import { createTodo } from './todo.slice';

function Header() {
  const [newTodo, setNewTodo] = useState<string>('');
  const dispatch = useAppDispatch();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewTodo(event.target.value);
  }

  function handleNewTodoKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    const title = newTodo.trim();

    if (title) {
      void dispatch(createTodo(title));
      setNewTodo('');
    }

    event.preventDefault();
  }

  return (
    <header className="header">
      <h1>todos</h1>
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        aria-label="Add a new todo"
        value={newTodo}
        onKeyDown={handleNewTodoKeyDown}
        onChange={handleChange}
      />
    </header>
  );
}

export default Header;
