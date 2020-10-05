import { logError, getPackageDirectoryMap, log } from "./utils";
import { buildPackage } from "./build";

// TODO: Detect internal dependencies and re-build them if they have changed
// since the last build.

(async function () {
  let args = process.argv.slice(2);
  if (!args || !args[0]) {
    log.red.bold(
      "You must pass a package name as an argument when building a single package."
    );
    process.exit(1);
  }

  try {
    let packageName = args[0].startsWith("@reach/")
      ? args[0]
      : `@reach/${args[0]}`;
    let packageMap = await getPackageDirectoryMap();
    let packagePath = packageMap[packageName];

    if (!packagePath) {
      log.red.bold("Invalid package passed as an argument.");
      process.exit(1);
    }

    buildPackage(packageName, packagePath);
  } catch (err) {
    logError(err);
  }
})();
