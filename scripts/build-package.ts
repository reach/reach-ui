import chalk from "chalk";
import { logError, getPackageDirectoryMap } from "./utils";
import { buildPackage } from "./build";

(async function () {
  let args = process.argv.slice(2);
  if (!args || !args[0]) {
    chalk.redBright.bold(
      "You must pass a package name as an argument when building a single package."
    );
    process.exit(1);
  }

  try {
    let packageName = `@reach/${args[0]}`;
    let packageMap = await getPackageDirectoryMap();
    let packagePath = packageMap[packageName];

    if (!packagePath) {
      throw Error("Invalid package passed as an argument");
    }

    buildPackage(packageName, packagePath);
  } catch (err) {
    logError(err);
  }
})();
