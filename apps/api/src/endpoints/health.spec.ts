import { testEndpoint } from 'express-zod-api';
import { createMockPool, createMockQueryResult } from 'slonik';

import { container, POOL_TOKEN } from '~app/container';
import { healthCheckEndpoint } from '~app/endpoints/health';

describe('Health endpoint', () => {
  beforeEach(() => {
    container.capture?.();
  });
  afterEach(() => {
    container.restore?.();
  });

  it('should return that the database is up', async () => {
    const pool = createMockPool({
      async query() {
        return createMockQueryResult([{ status: 'up' }]);
      },
    });
    container.bind(POOL_TOKEN).toConstant(pool);

    const { responseMock } = await testEndpoint({
      endpoint: healthCheckEndpoint,
    });

    expect(responseMock.json).toHaveBeenCalledWith({
      data: { database: { status: 'up' } },
      status: 'success',
    });
  });

  it('should throw an error when the database is down', async () => {
    const pool = createMockPool({
      async query() {
        return createMockQueryResult([]);
      },
    });
    container.bind(POOL_TOKEN).toConstant(pool);

    const { responseMock } = await testEndpoint({
      endpoint: healthCheckEndpoint,
    });

    expect(responseMock.json).toHaveBeenCalledWith({
      error: { message: { reason: 'database', status: 'down' } },
      status: 'error',
    });
  });
});
