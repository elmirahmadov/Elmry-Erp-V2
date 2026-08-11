import { env } from "@elmry/config";

export const appConfig = {
  port: env.PORT,
  env: env.NODE_ENV,

  database: {
    url: env.DATABASE_URL ?? "",
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },

  logLevel: env.LOG_LEVEL,
};
