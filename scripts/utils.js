import * as fsp from "node:fs/promises";
import * as prettier from "prettier";

export const jsonfile = {
	async readFile(file, options = {}) {
		if (typeof options === "string") {
			options = { encoding: options };
		}
		let data = await fsp.readFile(file, options);
		data = stripBom(data);
		let obj;
		try {
			obj = JSON.parse(data, options ? options.reviver : null);
		} catch (err) {
			err.message = `${file}: ${err.message}`;
			throw err;
		}
		return obj;
	},

	async writeFile(file, obj, options = {}) {
		let str = stringify(obj, options);
		await fsp.writeFile(
			file,
			prettier.format(str, { parser: "json" }),
			options
		);
	},
};

function stringify(
	obj,
	{ EOL = "\n", finalEOL = true, replacer = null, spaces } = {}
) {
	let EOF = finalEOL ? EOL : "";
	let str = JSON.stringify(obj, replacer, spaces);
	return str.replace(/\n/g, EOL) + EOF;
}

function stripBom(content) {
	if (Buffer.isBuffer(content)) {
		content = content.toString("utf8");
	}
	return content.replace(/^\uFEFF/, "");
}
