/* eslint-disable @typescript-eslint/naming-convention */
import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder) {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('tasks', {
    id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: {
      type: 'text',
      notNull: true,
    },
    completed: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    order: {
      type: 'int',
      notNull: true,
      sequenceGenerated: {
        precedence: 'BY DEFAULT',
      },
    },
    created_at: {
      type: 'timestamp(3)',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp(3)',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('tasks', [{ name: 'created_at', sort: 'ASC' }]);
}

export async function down(pgm: MigrationBuilder) {
  pgm.dropIndex('tasks', [{ name: 'created_at', sort: 'ASC' }]);

  pgm.dropTable('tasks');

  pgm.dropExtension('pgcrypto');
}
