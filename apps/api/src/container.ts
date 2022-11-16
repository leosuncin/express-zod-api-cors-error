import { createContainer, token } from 'brandi';
import type { DatabasePool } from 'slonik';

export const container = createContainer();

export const POOL_TOKEN = token<DatabasePool>('pool');
