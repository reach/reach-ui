import * as fsp from "node:fs/promises";
import * as url from "node:url";
import * as path from "node:path";
import { jsonfile } from "./utils.js";

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
		let pkgJson;
		try {
			pkgJson = await jsonfile.readFile(path.join(pkgPath, "package.json"));
		} catch (err) {
			console.error(
				`${path.basename(pkgPath)} is not a valid package. Skipping.`
			);
			continue;
		}

		let fileNameBase = "index";
		// let fileNameBase = pkg;

		pkgJson.main = `./dist/${fileNameBase}.cjs.js`;
		pkgJson.module = `./dist/${fileNameBase}.mjs`;
		pkgJson.types = `./dist/${fileNameBase}.d.ts`;

		promises.push(
			jsonfile.writeFile(path.join(pkgPath, "package.json"), pkgJson)
		);
	}
	await Promise.all(promises);
	console.log("Done updating packages");
}
