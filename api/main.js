const {
  createConfig,
  createServer,
  DependsOnMethod,
  defaultEndpointsFactory,
  z,
} = require('express-zod-api');

const input = z.object({ name: z.string().optional().default('world') });
const output = z.object({ message: z.string() });

/**
 * @type {import('express-zod-api').Routing}
 */
const routing = {
  hello: new DependsOnMethod({
    get: defaultEndpointsFactory.build({
      method: 'get',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from GET method`;
        logger.info(message);
        return { message };
      },
    }),
    post: defaultEndpointsFactory.build({
      method: 'post',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from POST method`;
        logger.info(message);
        return { message };
      },
    }),
    put: defaultEndpointsFactory.build({
      method: 'put',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from PUT method`;
        logger.info(message);
        return { message };
      },
    }),
    patch: defaultEndpointsFactory.build({
      method: 'patch',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from PATCH method`;
        logger.info(message);
        return { message };
      },
    }),
    delete: defaultEndpointsFactory.build({
      method: 'delete',
      input,
      output,
      async handler({ input, logger }) {
        const message = `Hello ${input.name} from DELETE method`;
        logger.info(message);
        return { message };
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
