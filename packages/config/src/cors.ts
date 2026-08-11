import { env } from "./env";

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:5174",
  "http://localhost:4174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4174",
];

export function resolveCorsOrigins(): string[] {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}
