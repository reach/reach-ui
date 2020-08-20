import { loadPackages, iter } from "lerna-script";
import { buildPackage } from "./build";
import {
  cleanDistDirectories,
  getPackageDirectoryMap,
  rainbowChalk,
  timeFromStart,
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
    console.log(rainbowChalk().bold(`Building ${pkg.name}`));
    return await buildPackage(pkg.name, packagePath);
  });

  console.log(`Finished build in ${timeFromStart(start)}`);
})();
