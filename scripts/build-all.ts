import { loadPackages, iter } from "lerna-script";
import { buildPackage } from "./build";
import {
  cleanDistDirectories,
  getPackageDirectoryMap,
  timeFromStart,
  log,
} from "./utils";

(async function () {
  let packages = await loadPackages();
  let packageMap = await getPackageDirectoryMap(packages);
  let start = Date.now();

  await cleanDistDirectories();
  await iter.batched(packages)(async (pkg) => {
    let packagePath = packageMap[pkg.name];
    if (!packagePath) {
      return;
    }
    log.rainbow.bold(`Building ${pkg.name}`);
    return await buildPackage(pkg.name, packagePath);
  });

  log.bold(`Finished build in ${timeFromStart(start)}`);
})();
