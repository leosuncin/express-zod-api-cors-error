import process from 'node:process';
import { cleanEnv, port, url } from 'envalid';
import { createConfig } from 'express-zod-api';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      readonly PORT: string;
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly DATABASE_URL: string;
    }
  }
}

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3333 }),
  DATABASE_URL: url(),
});

export const config = createConfig({
  cors: true,
  logger: {
    level: 'debug',
    color: true,
  },
  server: {
    listen: env.PORT,
  },
  startupLogo: false,
});
