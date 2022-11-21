import { render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { Provider } from 'react-redux';
import {
  mockDelete,
  mockFetch,
  mockGet,
  mockPatch,
  mockPost,
  mockPut,
} from 'vi-fetch';

import App from './App';
import { makeStore } from './app/store';
import { Filter, Todo } from './todo/todo.interface';

function buildResponse(data: unknown) {
  return { data, status: 'success' };
}

function renderApp(state?: Parameters<typeof makeStore>[0]) {
  const store = makeStore(state);

  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

mockFetch.setOptions({
  baseUrl: import.meta.env.VITE_API_URL,
});

describe('App', () => {
  const todos: Todo[] = [
    {
      id: '9600080b-2e70-4e89-9213-fe50f1d78f25',
      title: 'Buy milk',
      completed: false,
      order: 1,
    },
    {
      id: '08d593ff-18e4-4e4d-b390-77be06582e4e',
      title: 'Do the taxes',
      completed: true,
      order: 2,
    },
    {
      id: '83f44c28-3ae1-4291-acb5-a5814a733727',
      title: 'Conquer the world',
      completed: false,
      order: 3,
    },
  ];
  const loadedState = {
    todo: {
      ids: [todos[0].id, todos[1].id, todos[2].id],
      entities: {
        [todos[0].id]: todos[0],
        [todos[1].id]: todos[1],
        [todos[2].id]: todos[2],
      },
      filter: Filter.ALL_TODOS,
    },
  };

  beforeEach(() => {
    mockFetch.clearAll();
  });

  it('render the component', () => {
    renderApp();

    expect(screen.getByRole('heading')).toHaveTextContent('todo');
  });

  it('fetch the list of todo', async () => {
    mockGet('/todo').willResolve(buildResponse({ todos }));
    renderApp();

    await screen.findAllByRole('list');

    expect(
      within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
    ).toHaveLength(todos.length);
  });

  it('add a new todo', async () => {
    const title = 'Make a sandwich';
    mockPost('/todo').willResolve(
      buildResponse({
        id: '4cde9636-7b33-474d-9c1f-02ac51523054',
        title,
        completed: false,
        order: 1,
      }),
    );
    renderApp();

    await user.type(screen.getByRole('textbox'), title + '{Enter}');

    await screen.findAllByRole('list');

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('mark one todo as completed', async () => {
    mockPut(`/todo/${todos[0].id}`).willResolveOnce(
      buildResponse({
        ...todos[0],
        completed: true,
      }),
    );
    renderApp(loadedState);

    const checkbox = screen.getByRole('checkbox', {
      name: `Toggle ${todos[0].title}`,
    });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('edit one todo', async () => {
    const title = 'Buy ice cream';
    mockPut(`/todo/${todos[0].id}`).willResolveOnce(
      buildResponse({
        ...todos[0],
        title,
      }),
    );
    renderApp(loadedState);

    await user.dblClick(screen.getByText(todos[0].title));
    await user.clear(screen.getByLabelText(`Edit ${todos[0].title}`));
    await user.type(
      screen.getByLabelText(`Edit ${todos[0].title}`),
      title + '{Enter}',
    );

    await expect(screen.findByText(title)).resolves.toBeVisible();
  });

  it('remove one todo', async () => {
    mockDelete(`/todo/${todos[1].id}`).willResolve(buildResponse(todos[1]));
    renderApp(loadedState);

    await user.click(screen.getByLabelText(`Remove ${todos[1].title}`));

    expect(screen.queryByText(todos[1].title)).not.toBeInTheDocument();
  });

  it('toggle all of the todos', async () => {
    mockPatch('/todo').willResolve(
      buildResponse({
        todos: [
          { ...todos[0], completed: true },
          { ...todos[2], completed: true },
        ],
      }),
    );
    renderApp(loadedState);

    await user.click(screen.getByLabelText('Toggle all'));

    await waitFor(() =>
      expect(
        screen.getByRole('checkbox', {
          name: `Toggle ${todos[0].title}`,
        }),
      ).toBeChecked(),
    );

    expect(screen.getByRole('checkbox', { name: 'Toggle all' })).toBeChecked();
  });

  it('clear all of the completed todos', async () => {
    mockDelete('/todo', false).willResolve(
      buildResponse({ todos: [todos[1]] }),
    );
    renderApp(loadedState);

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    await waitFor(() =>
      expect(
        within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
      ).toHaveLength(2),
    );

    expect(screen.getByText(todos[0].title)).toBeVisible();
    expect(screen.getByText(todos[2].title)).toBeVisible();
  });

  it('filter the todos', async () => {
    const countActive = todos.reduce(
      (count, todo) => (todo.completed ? count : count + 1),
      0,
    );
    renderApp(loadedState);

    expect(
      within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
    ).toHaveLength(todos.length);

    await user.click(screen.getByRole('link', { name: 'Active' }));

    expect(
      within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
    ).toHaveLength(countActive);

    await user.click(screen.getByRole('link', { name: 'Completed' }));

    expect(
      within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
    ).toHaveLength(todos.length - countActive);

    await user.click(screen.getByRole('link', { name: 'All' }));

    expect(
      within(screen.getAllByRole('list')[0]).getAllByRole('listitem'),
    ).toHaveLength(todos.length);
  });
});
