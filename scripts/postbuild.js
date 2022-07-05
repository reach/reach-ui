import * as fsp from "fs/promises";
import * as url from "url";
import * as path from "path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../");

main();

async function main() {
  let packages = await fsp.readdir(path.join(ROOT_DIR, "packages"));
  let promises = [];
  for (let pkg of packages) {
    let pkgPath = path.join(ROOT_DIR, "packages", pkg);
    if (!(await fsp.lstat(pkgPath)).isDirectory()) {
      continue;
    }
    let distDir = path.join(pkgPath, "dist");
    try {
      if (!(await fsp.lstat(distDir)).isDirectory()) {
        throw Error();
      }
    } catch (err) {
      console.error(
        `${path.basename(
          pkg
        )} has no dist directory. Be sure to run pnpm build before running this script.`
      );
      continue;
    }
    let fileNameBase = `index`;
    // let fileNameBase = `reach-${pkg}`;
    let cjsEntry = `"use strict";

if (process.env.NODE_ENV === "production") {
	module.exports = require("./${fileNameBase}.cjs.prod.js");
} else {
	module.exports = require("./${fileNameBase}.cjs.dev.js");
}
`;
    promises.push(
      fsp.writeFile(path.join(distDir, `${fileNameBase}.cjs.js`), cjsEntry)
    );
  }
  await Promise.all(promises);
  console.log("Done writing CJS entry files");
}
