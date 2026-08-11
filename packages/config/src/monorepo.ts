import fs from "fs";
import path from "path";

/**
 * Walks up from a start directory until it finds the monorepo root
 * (turbo.json + package.json with apps/packages workspaces).
 */
export function findMonorepoRoot(startDir: string): string | undefined {
  let currentDir = startDir;

  while (true) {
    const turboPath = path.join(currentDir, "turbo.json");
    const packagePath = path.join(currentDir, "package.json");

    if (fs.existsSync(turboPath) && fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8")) as {
          workspaces?: string[] | { packages?: string[] };
        };
        const workspaces = Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : pkg.workspaces?.packages;

        if (
          workspaces?.some((w) => w.includes("packages") || w.includes("apps"))
        ) {
          return currentDir;
        }
      } catch {
        return currentDir;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return undefined;
    currentDir = parentDir;
  }
}

export function getMonorepoRoot(): string | undefined {
  return findMonorepoRoot(process.cwd()) || findMonorepoRoot(__dirname);
}
