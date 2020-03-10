import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { camelCase } from "lodash";
import mri from "mri";
import glob from "tiny-glob/sync";
import { paths } from "./constants";
import { NormalizedOpts, ModuleFormat, Many } from "./types";

const stderr = console.error.bind(console);

// Remove the package name scope if it exists
export function removeScope(name: string) {
  return name.replace(/^@.*\//, "");
}

// UMD-safe package name
export function safeVariableName(name: string) {
  return camelCase(
    removeScope(name)
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, "")
  );
}

export function isTruthy(obj?: any) {
  if (!obj) {
    return false;
  }
  return obj.constructor !== Object || Object.keys(obj).length > 0;
}

export function safePackageName(name: string) {
  return name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, "");
}

export function external(id: string) {
  return !id.startsWith(".") && !path.isAbsolute(id);
}

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
export const appDirectory = fs.realpathSync(process.cwd());
export function resolveApp(relativePath: string) {
  return path.resolve(appDirectory, relativePath);
}

// Taken from Create React App, react-dev-utils/clearConsole
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/clearConsole.js
export function clearConsole() {
  process.stdout.write(
    process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
  );
}

let push = Array.prototype.push;

/**
 * Concats an array of arrays into a single flat array.
 *
 * @param array
 */
export function concatAllArray<T>(array: Many<T>[]) {
  const ret: T[] = [];
  for (let ii = 0; ii < array.length; ii++) {
    const value = array[ii];
    if (Array.isArray(value)) {
      push.apply(ret, value);
    } else if (value != null) {
      throw new TypeError(
        "concatAllArray: All items in the array must be an array or null, " +
          'got "' +
          value +
          '" at index "' +
          ii +
          '" instead'
      );
    }
  }
  return ret;
}

export async function isFile(name: string) {
  try {
    const stats = await fs.stat(name);
    return stats.isFile();
  } catch (e) {
    return false;
  }
}

export async function jsOrTs(filename: string) {
  const extension = (await isFile(resolveApp(filename + ".ts")))
    ? ".ts"
    : (await isFile(resolveApp(filename + ".tsx")))
    ? ".tsx"
    : (await isFile(resolveApp(filename + ".jsx")))
    ? ".jsx"
    : ".js";

  return resolveApp(`${filename}${extension}`);
}

export async function isDir(name: string) {
  try {
    const stats = await fs.stat(name);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
}

export async function getInputs(
  entries?: string | string[]
): Promise<string[]> {
  let inputs: string[] = [];
  let stub: any[] = [];
  stub
    .concat(
      entries && entries.length
        ? entries
        : (await isDir(resolveApp("src"))) && (await jsOrTs("src/index"))
    )
    .map(file => glob(file))
    .forEach(input => inputs.push(input));

  return concatAllArray(inputs);
}

export function getAppName(opts: any) {
  return opts.name || path.basename(paths.appRoot);
}

export async function normalizeOpts(opts: any): Promise<NormalizedOpts> {
  return {
    ...opts,
    name: getAppName(opts),
    input: await getInputs(opts.entry),
    format: opts.format.split(",").map((format: string) => {
      if (format === "es") {
        return "esm";
      }
      return format;
    }) as [ModuleFormat, ...ModuleFormat[]],
  };
}

export async function createProgressEstimator() {
  await fs.ensureDir(paths.progressEstimatorCache);
  return require("progress-estimator")({
    // All configuration keys are optional, but it's recommended to specify a storage location.
    storagePath: paths.progressEstimatorCache,
  });
}

export function logError(err: any) {
  const error = err.error || err;
  const description = `${error.name ? error.name + ": " : ""}${error.message ||
    error}`;
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

export async function cleanDistFolder() {
  await fs.remove(paths.appDist);
}

export function parseArgs() {
  return mri(process.argv.slice(2));
}
