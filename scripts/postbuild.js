import * as fsp from "node:fs/promises";
import * as url from "node:url";
import * as path from "node:path";

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
		// let fileNameBase = pkg;
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

	promises.push(
		fsp.writeFile(path.join(ROOT_DIR, "LICENSE"), getLicenseContent())
	);

	await Promise.all(promises);
	console.log("🛠 Done building");
}

function getLicenseContent() {
	return `The MIT License (MIT)

Copyright (c) 2018-${new Date().getFullYear()}, React Training LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;
}
