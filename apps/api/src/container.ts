import { createContainer, token } from 'brandi';
import type { DatabasePool } from 'slonik';

import type { TaskService } from '~app/services/task';

export const container = createContainer();

export const POOL_TOKEN = token<DatabasePool>('pool');

export const TASK_SERVICE_TOKEN = token<TaskService>('TaskService');
