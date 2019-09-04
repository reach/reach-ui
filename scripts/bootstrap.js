const execSync = require("child_process").execSync;

function exec(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

if (process.env.CI) {
  exec("lerna bootstrap --ci");
} else {
  exec("lerna bootstrap --no-ci");
}
