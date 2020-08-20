import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import mri from "mri";
import ms from "pretty-ms";
import { loadPackages, LernaPackage } from "lerna-script";
import createLogger, { ProgressEstimator } from "progress-estimator";
import { exec } from "child_process";
import { paths } from "./constants";
import { NormalizedOpts, TSConfigJSON } from "./types";

let stderr = console.error.bind(console);
let cachedProgressEstimator: ProgressEstimator;

export async function normalizeOpts<
  O extends object & {
    name: string;
    packageRoot: string;
    input: string | string[];
  }
>(opts: O): Promise<NormalizedOpts> {
  let { name } = opts;
  let packageSrc = path.join(opts.packageRoot, "src");
  let packageDist = path.join(opts.packageRoot, "dist");

  return {
    ...opts,
    name,
    input: Array.isArray(opts.input) ? opts.input : [opts.input],
    packageSrc,
    packageDist,
  };
}

export async function createProgressEstimator() {
  if (!cachedProgressEstimator) {
    await fs.ensureDir(paths.progressEstimatorCache);
    return (cachedProgressEstimator = await createLogger({
      // All configuration keys are optional, but it's recommended to specify a
      // storage location.
      storagePath: paths.progressEstimatorCache,
    }));
  }
  return cachedProgressEstimator;
}

export function logError(err: any) {
  const error = err.error || err;
  const description = `${error.name ? error.name + ": " : ""}${
    error.message || error
  }`;
  const message = error.plugin
    ? error.plugin === "rpt2"
      ? `(typescript) ${description}`
      : `(${error.plugin} plugin) ${description}`
    : description;

  stderr(chalk.bold.red(message));

  if (error.loc) {
    stderr();
    stderr(`at ${error.loc.file}:${error.loc.line}:${error.loc.column}`);
  }

  if (error.frame) {
    stderr();
    stderr(chalk.dim(error.frame));
  } else if (err.stack) {
    const headlessStack = error.stack.replace(message, "");
    stderr(chalk.dim(headlessStack));
  }

  stderr();
}

export function parseArgs() {
  let { _, ...args } = mri(process.argv.slice(2));
  return args;
}

export function flatten(arr: any[][]): any[] {
  return arr.reduce((flat, next) => flat.concat(next), []);
}

export function getRootTsConfig(): TSConfigJSON {
  return fs.readJSONSync(path.join(paths.projectRoot, "tsconfig.json"));
}

export async function getPackageDirectoryMap(pkgs?: LernaPackage[]) {
  let packageMap: Record<string, string> = {};
  let rootTsConfig = getRootTsConfig();

  if (!pkgs) {
    pkgs = await loadPackages();
  }

  for (let pkg of pkgs) {
    if (
      // Only concerned with internal published packages with the @reach scope
      !pkg.name.startsWith("@reach")
    ) {
      continue;
    }

    packageMap[pkg.name] = rootTsConfig.compilerOptions.paths![pkg.name]![0];
  }

  return packageMap;
}

export function timeFromStart(start: number) {
  return ms(Date.now() - start);
}

export async function cleanDistDirectories() {
  return await new Promise((resolve, reject) => {
    exec(
      `rm -rf ${path.join(paths.projectRoot, "packages", "*", "dist")}`,
      (err) => (err ? reject(err.message) : resolve("deleted"))
    );
  });
}

export function dirIsParentOf(parent: string, dir: string) {
  const relative = path.relative(parent, dir);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

// 🌈🌈🌈 for our logs
let currentChalk = 0;
let CHALK_COLORS = [
  "magenta",
  "red",
  "yellow",
  "green",
  "blue",
  "cyan",
] as const;
export function rainbowChalk() {
  let c = chalk[CHALK_COLORS[currentChalk]];
  currentChalk = currentChalk >= CHALK_COLORS.length - 1 ? 0 : currentChalk + 1;
  return c;
}
