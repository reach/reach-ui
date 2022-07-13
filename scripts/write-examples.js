import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import camelCase from "lodash/camelCase.js";

writeExampleIndex();

async function writeExampleIndex() {
  try {
    let cwd = process.cwd();
    let packages = await fs.promises.readdir(path.resolve(cwd, "packages"));

    for (let pkg of packages) {
      let packageName = ucFirst(camelCase(pkg));
      let componentName;
      switch (pkg) {
        case "":
        default:
          componentName = packageName;
      }

      let examplesPath = path.resolve(cwd, "packages", pkg, "examples/");
      if (await directoryExists(examplesPath)) {
        let contents = "";
        let foundExample = false;
        let examples = await fs.promises.readdir(examplesPath);
        for (let example of examples) {
          let ext = path.extname(example);
          if (
            [".js", ".ts", ".tsx"].includes(ext) &&
            example.includes(".example.")
          ) {
            foundExample = true;
            let baseName = path.basename(example, ".example" + ext);
            let moduleName =
              ucFirst(camelCase(baseName)) +
              ([".ts", ".tsx"].includes(ext) ? "TS" : "");

            contents += `export { Example as ${moduleName} } from "./${example}";\n`;
          }
        }

        if (foundExample) {
          contents += `\nexport default {\n  title: "${componentName}",\n};\n`;
          await fs.promises.writeFile(
            path.resolve(examplesPath, "index.story.js"),
            contents
          );
          console.log(
            chalk.green(`Story file created for ${chalk.bold(pkg)} examples!`)
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * @param {string} string
 * @returns {Promise<boolean>}
 */
async function directoryExists(path) {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return (await fs.promises.lstat(path)).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * @param {string} string
 * @returns {string}
 */
function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
