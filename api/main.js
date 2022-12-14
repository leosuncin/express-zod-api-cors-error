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

const get = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  method: 'get',
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from GET method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});
const post = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  method: 'post',
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from POST method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});
const put = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  method: 'put',
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from PUT method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});
const patch = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  method: 'patch',
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from PATCH method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});
const del = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  method: 'delete',
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from DELETE method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});
const all = defaultEndpointsFactory.addMiddleware(authMiddleware).build({
  methods: ['delete', 'get', 'patch', 'post', 'put'],
  input,
  output,
  async handler({ input, logger, options }) {
    const message = `Hello ${input.name} from unknown method`;
    logger.info(message);
    return { message, authorized: Boolean(options.token) };
  },
});

/**
 * @type {import('express-zod-api').Routing}
 */
const routing = {
  hello: new DependsOnMethod({
    get,
    post,
    put,
    patch,
    delete: del,
  }),
  get,
  post,
  put,
  patch,
  delete: del,
  all,
};

const config = createConfig({
  cors({ defaultHeaders }) {
    return {
      ...defaultHeaders,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  },
  logger: {
    level: 'debug',
    color: true,
  },
  server: {
    listen: process.env['PORT'] ?? 3010,
  },
});

createServer(config, routing);
