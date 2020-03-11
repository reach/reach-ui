// Forked and simplified from https://github.com/jaredpalmer/tsdx
import * as jest from "jest";
import jestConfig from "./config/jest";

async function testAction() {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";
  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on("unhandledRejection", err => {
    throw err;
  });

  const argv = process.argv.slice(2);

  // Test individual package or packages with the --pkg argument
  if (argv.includes("--pkg")) {
    let i = argv.indexOf("--pkg");
    argv.splice(
      i,
      2,
      `packages/(${argv[i + 1]
        .split(",")
        .map(str => str.trim())
        .join("|")})`
    );
  }

  argv.push(
    "--verbose",
    "--config",
    JSON.stringify({
      ...jestConfig,
    })
  );

  const [...argsToPassToJestCli] = argv;
  jest.run(argsToPassToJestCli);
}

testAction();
