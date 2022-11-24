const {
  createConfig,
  createMiddleware,
  createServer,
  DependsOnMethod,
  defaultEndpointsFactory,
  z,
} = require('express-zod-api');

const input = z.object({ name: z.string().optional().default('world') });
const output = z.object({
  message: z.string(),
  authorized: z.boolean().optional().default(false),
});

const authMiddleware = createMiddleware({
  input: z.object({}),
  async middleware({ logger, request }) {
    logger.debug('headers', request.headers);

    if (request.headers.authorization) {
      const [type, token] = request.headers.authorization.split(' ');
      logger.debug(`Authorization ${type}`, { token });

      return { token };
    }

    return {};
  },
});

/**
 * @type {import('express-zod-api').Routing}
 */
const routing = {
  hello: new DependsOnMethod({
    get: defaultEndpointsFactory.addMiddleware(authMiddleware).build({
      method: 'get',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from GET method`;
        logger.info(message);
        return { message, authorized: Boolean(input.token) };
      },
    }),
    post: defaultEndpointsFactory.addMiddleware(authMiddleware).build({
      method: 'post',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from POST method`;
        logger.info(message);
        return { message, authorized: Boolean(input.token) };
      },
    }),
    put: defaultEndpointsFactory.addMiddleware(authMiddleware).build({
      method: 'put',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from PUT method`;
        logger.info(message);
        return { message, authorized: Boolean(input.token) };
      },
    }),
    patch: defaultEndpointsFactory.addMiddleware(authMiddleware).build({
      method: 'patch',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from PATCH method`;
        logger.info(message);
        return { message, authorized: Boolean(input.token) };
      },
    }),
    delete: defaultEndpointsFactory.addMiddleware(authMiddleware).build({
      method: 'delete',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from DELETE method`;
        logger.info(message);
        return { message, authorized: Boolean(input.token) };
      },
    }),
  }),
};

const config = createConfig({
  cors: true,
  logger: {
    level: 'debug',
    color: true,
  },
  server: {
    listen: process.env['PORT'] ?? 3010,
  },
});

createServer(config, routing);
