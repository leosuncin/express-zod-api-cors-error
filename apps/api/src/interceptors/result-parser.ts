import { z } from 'express-zod-api';
import {
  type Interceptor,
  type QueryResultRow,
  SchemaValidationError,
} from 'slonik';

export function createResultParserInterceptor(): Interceptor {
  return {
    transformRow(executionContext, actualQuery, row): QueryResultRow {
      const { resultParser } = executionContext;

      if (!resultParser) {
        return row;
      }

      try {
        return resultParser.parse(row);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new SchemaValidationError(
            actualQuery,
            row as any,
            error.issues,
          );
        }

        throw error;
      }
    },
  };
}
