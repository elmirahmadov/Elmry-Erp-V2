import { PrismaClient, Prisma } from "../generated/client";
import { env, loadedEnvPaths } from "@elmry/config";

export { Prisma, PrismaClient };
export * from "../generated/client";

const globalForPrisma = globalThis as unknown as {
  __elmryPrisma?: PrismaClient;
};

function resolveDatabaseUrl(): string {
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    const checked =
      loadedEnvPaths.length > 0
        ? loadedEnvPaths.join(", ")
        : "(no .env files found — create one at the monorepo root)";

    throw new Error(
      [
        "DATABASE_URL environment variable is not set.",
        "Create a `.env` file at the monorepo root (copy from `.env.example`).",
        `Checked: ${checked}`,
      ].join(" "),
    );
  }

  return databaseUrl;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (env.NODE_ENV !== "production" && globalForPrisma.__elmryPrisma) {
    return globalForPrisma.__elmryPrisma;
  }

  const client = createPrismaClient();

  if (env.NODE_ENV !== "production") {
    globalForPrisma.__elmryPrisma = client;
  }

  return client;
}

/** Lazy singleton — safe to import before env is fully ready. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
