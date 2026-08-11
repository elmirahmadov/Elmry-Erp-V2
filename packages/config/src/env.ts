import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { z } from "zod";
import { findMonorepoRoot } from "./monorepo";

function collectEnvFiles(): string[] {
  const files: string[] = [];
  const seen = new Set<string>();

  const add = (filePath: string) => {
    const resolved = path.resolve(filePath);
    if (!seen.has(resolved) && fs.existsSync(resolved)) {
      seen.add(resolved);
      files.push(resolved);
    }
  };

  const roots = [
    findMonorepoRoot(process.cwd()),
    findMonorepoRoot(__dirname),
  ].filter(Boolean) as string[];

  for (const root of roots) {
    // Single source of truth: monorepo root `.env`
    add(path.join(root, ".env"));
  }

  let currentDir = process.cwd();
  while (true) {
    add(path.join(currentDir, ".env"));
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  return files;
}

const loadedEnvFiles = collectEnvFiles();
for (const envFile of loadedEnvFiles) {
  dotenv.config({ path: envFile, override: false });
}

export const loadedEnvPaths = loadedEnvFiles;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().default(5000),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().default("secret"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export type Env = typeof env;
