const fs = require("fs");
const execSync = require("child_process").execSync;
const prettyBytes = require("pretty-bytes");
const gzipSize = require("gzip-size");

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: "inherit",
    env: Object.assign({}, process.env, extraEnv)
  });

////////////////////////////////////////////////////////////////////////////////
// No compat
console.log("Building CommonJS modules ...");

exec("babel src -d . --ignore *.test.js", {
  BABEL_ENV: "cjs"
});

console.log("\nBuilding ES modules ...");

exec("babel src -d es --ignore *.test.js", {
  BABEL_ENV: "es"
});

console.log("\nBuilding UMD ...");

exec("rollup -c -f umd -o umd/reactions-router.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "development"
});

console.log("\nBuilding UMD min.js ...");

exec("rollup -c -f umd -o umd/reactions-router.min.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "production"
});

const size = gzipSize.sync(fs.readFileSync("umd/reactions-router.min.js"));

console.log("\ngzipped, the UMD build is %s", prettyBytes(size));

////////////////////////////////////////////////////////////////////////////////
// With Compat

console.log("Building CommonJS modules ...");

exec("babel src -d compat --ignore *.test.js", {
  BABEL_ENV: "cjs",
  COMPAT: "1"
});

console.log("\nBuilding ES modules ...");

exec("babel src -d es/compat --ignore *.test.js", {
  BABEL_ENV: "es",
  COMPAT: "1"
});

console.log("\nBuilding UMD ...");

exec("rollup -c -f umd -o umd/reactions-router-compat.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "development",
  COMPAT: "1"
});

console.log("\nBuilding UMD min.js ...");

exec("rollup -c -f umd -o umd/reactions-router-compate.min.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "production",
  COMPAT: "1"
});

const compatSize = gzipSize.sync(
  fs.readFileSync("umd/reactions-router-compat.min.js")
);

console.log("\ngzipped, the UMD build is %s", prettyBytes(compatSize));
