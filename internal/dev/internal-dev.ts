import fs from "fs";
import path from "path";
import { defineConfig } from "tsup";
import type { Options } from "tsup";
import type { TsupConfig } from "./types";

export function getTsupConfig(
  entry: string | string[],
  {
    packageName,
    packageVersion,
    external = [],
  }: {
    packageName: string;
    packageVersion: string;
    external?: string[];
    define?: Record<string, string>;
  }
): TsupConfig {
  entry = Array.isArray(entry) ? entry : [entry];
  external = [...new Set(["react", "react-dom"]), ...external];
  let banner = createBanner(packageName, packageVersion);
  return defineConfig([
    // cjs.dev.js
    {
      entry,
      format: "cjs",
      sourcemap: true,
      outExtension: getOutExtension("dev"),
      external,
      banner: { js: banner },
      define: {
        "process.env.NODE_ENV": "'development'",
      },
    },

    // cjs.prod.js
    {
      entry,
      format: "cjs",
      minify: true,
      minifySyntax: true,
      outExtension: getOutExtension("prod"),
      external,
      pure: ["warning"],
      // @ts-ignore
      drop: ["console"],
      define: {
        "process.env.NODE_ENV": "'production'",
      },
    },

    // esm
    {
      entry,
      dts: { banner, only: true },
      format: "esm",
      external,
      banner: { js: banner },
      define: {
        "process.env.NODE_ENV": "'development'",
      },
    },
  ]);
}

function getOutExtension(env: "dev" | "prod"): Options["outExtension"] {
  return ({ format }) => ({ js: `.${format}.${env}.js` });
}

function createBanner(packageName: string, version: string) {
  return `/**
  * ${packageName} v${version}
  *
  * Copyright (c) React Training
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE.md file in the root directory of this source tree.
  *
  * @license MIT
  */
`;
}

export function getPackageInfo(packageRoot: string): {
  version: string;
  name: string;
} {
  let packageJson = fs.readFileSync(
    path.join(packageRoot, "package.json"),
    "utf8"
  );
  let { version, name } = JSON.parse(packageJson);
  return { version, name };
}
