import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Filter } from './todo.interface';
import {
  changeFilter,
  clearCompleted,
  selectActiveCount,
  selectCompletedCount,
  selectFilter,
} from './todo.slice';

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function Footer() {
  const activeCount = useAppSelector(selectActiveCount);
  const completedCount = useAppSelector(selectCompletedCount);
  const filter = useAppSelector(selectFilter);
  const dispatch = useAppDispatch();
  const activeTodoWord = pluralize(activeCount, 'item');

  function handleChangeFilter(event: React.MouseEvent<HTMLAnchorElement>) {
    const link: HTMLAnchorElement = event.target as HTMLAnchorElement;

    switch (link.hash) {
      case '#/active':
        dispatch(changeFilter(Filter.ACTIVE_TODOS));
        break;
      case '#/completed':
        dispatch(changeFilter(Filter.COMPLETED_TODOS));
        break;
      default:
        dispatch(changeFilter(Filter.ALL_TODOS));
        break;
    }

    event.preventDefault();
  }

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount}</strong> {activeTodoWord} left
      </span>
      <ul className="filters">
        <li>
          <a
            href="#/"
            className={classNames({
              selected: filter === Filter.ALL_TODOS,
            })}
            onClick={handleChangeFilter}
          >
            All
          </a>
        </li>{' '}
        <li>
          <a
            href="#/active"
            className={classNames({
              selected: filter === Filter.ACTIVE_TODOS,
            })}
            onClick={handleChangeFilter}
          >
            Active
          </a>
        </li>{' '}
        <li>
          <a
            href="#/completed"
            className={classNames({
              selected: filter === Filter.COMPLETED_TODOS,
            })}
            onClick={handleChangeFilter}
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 ? (
        <button
          type="button"
          className="clear-completed"
          onClick={() => dispatch(clearCompleted())}
        >
          Clear completed
        </button>
      ) : null}
    </footer>
  );
}

export default Footer;
