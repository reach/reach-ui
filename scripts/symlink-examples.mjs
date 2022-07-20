import * as path from "node:path";
import * as fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.join(__dirname, "../packages");
const STORIES_DIR = path.join(__dirname, "../playground/stories");

let args = process.argv.slice(2);
let packageArg = args.includes("--pkg")
  ? args[args.findIndex((arg) => arg === "--pkg") + 1]
  : undefined;
if (packageArg) {
  packageArg = packageArg.startsWith(`packages/`)
    ? packageArg.slice(9)
    : packageArg;
}
let removeFirst = args.includes("--remove-first") || args.includes("-r");

main();

async function main() {
  if (packageArg) {
    await createSymlink(packageArg, { removeFirst });
  } else {
    let promises = [];
    let packagePaths = await getPackagePaths();
    for (let pkgPath of packagePaths) {
      promises.push(createSymlink(path.basename(pkgPath), { removeFirst }));
    }
    await Promise.all(promises);
  }
  console.log("Symlink'd examples");
}

/**
 * @param {string} pkg
 */
async function createSymlink(pkg, opts = {}) {
  let { removeFirst = false } = opts;
  let srcPath = path.join(STORIES_DIR, pkg);
  if (!(await directoryExists(srcPath))) {
    return;
  }

  let symlinkPath = path.join(PACKAGE_DIR, pkg, "examples");
  if (removeFirst && (await directoryExists(symlinkPath))) {
    await fsp.rm(symlinkPath, { recursive: true });
    await fsp.symlink(srcPath, symlinkPath, "dir");
  } else if (!(await directoryExists(symlinkPath))) {
    await fsp.symlink(srcPath, symlinkPath, "dir");
  }
}

async function getPackagePaths() {
  let packagePaths = [];
  let files = await fsp.readdir(PACKAGE_DIR);
  for (let file of files) {
    let filePath = path.join(PACKAGE_DIR, file);
    if ((await fsp.stat(filePath)).isDirectory()) {
      packagePaths.push(filePath);
    }
  }
  return packagePaths;
}

/**
 * @param {string} filePath
 */
async function directoryExists(filePath) {
  try {
    return (await fsp.stat(filePath)).isDirectory();
  } catch (e) {
    return false;
  }
}
