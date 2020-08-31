// Forked and simplified from https://github.com/jaredpalmer/tsdx
import { DEFAULT_EXTENSIONS, createConfigItem } from "@babel/core";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import { merge } from "lodash";
import path from "path";
import { rollup, RollupOptions } from "rollup";
import babelPlugin from "rollup-plugin-babel";
import sourceMaps from "rollup-plugin-sourcemaps";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { MapLike } from "typescript";
import { paths } from "./constants";
import { ScriptOpts, NormalizedOpts } from "./types";
import * as fs from "fs-extra";
import { getRootTsConfig, dirIsParentOf } from "./utils";
import {
  createProgressEstimator,
  flatten,
  logError,
  normalizeOpts,
  parseArgs,
} from "./utils";

// shebang cache map thing because the transform only gets run once
let shebang: any = {};

let rootTsConfig = getRootTsConfig();

export async function createRollupConfig(
  opts: ScriptOpts,
  buildCount: number
): Promise<RollupOptions> {
  let {
    input,
    format,
    name,
    packageRoot,
    packageDist: outDir,
    env,
    tsconfig,
    target,
  } = opts;

  let shouldMinify =
    opts.minify !== undefined
      ? opts.minify
      : env === "production" && format !== "esm";

  let outputName = [
    path.join(outDir, name),
    format,
    env,
    shouldMinify ? "min" : "",
    "js",
  ]
    .filter(Boolean)
    .join(".");

  // Look for local tsconfig if passed to options
  let tsconfigJSON = rootTsConfig;
  if (tsconfig) {
    try {
      tsconfigJSON = fs.readJSONSync(tsconfig);
      if (!tsconfigJSON) throw Error("oh no");
    } catch (e) {
      //
    }
  }

  let rootPathAliases = rootTsConfig.compilerOptions.paths || {};

  return {
    input,
    external(id) {
      return !id.startsWith(".") && !path.isAbsolute(id);
    },
    output: {
      file: outputName,
      name,
      format,
      // Do not let Rollup call Object.freeze() on namespace import objects
      // (i.e. import * as namespaceImportObject from...) that are accessed
      // dynamically.
      freeze: false,
      // Respect tsconfig esModuleInterop when setting __esModule.
      esModule: tsconfigJSON?.compilerOptions?.esModuleInterop || false,
      sourcemap: true,
      globals: { react: "React", "react-native": "ReactNative" },
      exports: "named",
    },
    plugins: [
      resolve({
        mainFields: [
          "module",
          "main",
          target !== "node" ? "browser" : undefined,
        ].filter(Boolean) as string[],
      }),
      format === "umd" &&
        commonjs({
          // use a regex to make sure to include eventual hoisted packages
          include: /\/node_modules\//,
        }),
      json(),
      {
        // Custom plugin that removes shebang from code because newer
        // versions of bublé bundle their own private version of `acorn`
        // and I don't know a way to patch in the option `allowHashBang`
        // to acorn. Taken from microbundle.
        // See: https://github.com/Rich-Harris/buble/pull/165
        transform(code: string) {
          let reg = /^#!(.*)/;
          let match = code.match(reg);

          shebang[opts.name] = match ? "#!" + match[1] : "";

          code = code.replace(reg, "");

          return {
            code,
            map: null,
          };
        },
      },
      typescript({
        typescript: require("typescript"),
        cacheRoot: path.join(paths.projectCache, `build/${name}/${format}`),
        tsconfig,
        tsconfigDefaults: {
          exclude: [
            // all TS test files, regardless whether co-located or in test/ etc
            "**/*.spec.ts",
            "**/*.test.ts",
            "**/*.spec.tsx",
            "**/*.test.tsx",
            // TS defaults below
            "node_modules",
            "bower_components",
            "jspm_packages",
            outDir,
          ],
          compilerOptions: {
            sourceMap: true,
            jsx: "react",
          },
        },
        tsconfigOverride: {
          allowJs: true,
          include: [
            path.resolve(packageRoot, "src"),
            path.resolve(packageRoot, "types"),
            path.resolve(paths.projectRoot, "types"),
          ],
          compilerOptions: {
            target: "esnext",
            outDir,
            // In our root TS config we define path aliases for internal
            // packages that map to the /src directory. When we build, we need
            // to re-map these paths to the output directory as /src is not
            // published to NPM and import() calls in type files would break as
            // a result.
            // https://github.com/reach/reach-ui/issues/660
            paths: Object.keys(rootPathAliases).reduce<MapLike<string[]>>(
              function remapPathAliases(acc, cur) {
                let pathList = rootPathAliases[cur] || [];
                return {
                  ...acc,
                  [cur]: cur.startsWith("@reach")
                    ? pathList.map((path) => path.replace("/src", ""))
                    : pathList,
                };
              },
              {}
            ),

            // We only need output type declarations once per package.
            ...(buildCount > 0
              ? {
                  declaration: false,
                  declarationMap: false,
                }
              : {
                  declaration: true,
                  declarationMap: false,
                  declarationDir: outDir,
                }),
          },
        },
        useTsconfigDeclarationDir: true,
        // check: opts.transpileOnly !== undefined ? !opts.transpileOnly : false,
      }),
      babelPluginReach({
        exclude: "node_modules/**",
        extensions: [...DEFAULT_EXTENSIONS, "ts", "tsx"],
        passPerPreset: true,
        custom: {
          targets: target === "node" ? { node: "8" } : undefined,
          format,
        },
      }),
      env !== undefined &&
        replace({
          "process.env.NODE_ENV": JSON.stringify(env),
        }),
      sourceMaps(),
      shouldMinify &&
        terser({
          format: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
            passes: 10,
          },
          ecma: 5,
          toplevel: format === "cjs",
        }),
    ],
  };
}

export const babelPluginReach = babelPlugin.custom(() => ({
  // Passed the plugin options.
  options({ custom: customOptions, ...pluginOptions }: any) {
    return {
      // Pull out any custom options that the plugin might have.
      customOptions,

      // Pass the options back with the two custom options removed.
      pluginOptions,
    };
  },
  config(config: any, { customOptions }: any) {
    let defaultPlugins = createConfigItems("plugin", [
      { name: "babel-plugin-annotate-pure-calls" },
      { name: "babel-plugin-dev-expression" },
      {
        name: "@babel/plugin-proposal-class-properties",
        loose: true,
      },
      { name: "@babel/plugin-proposal-optional-chaining" },
      { name: "@babel/plugin-proposal-nullish-coalescing-operator" },
      { name: "babel-plugin-macros" },
    ]);

    let babelOptions = config.options || {};
    babelOptions.presets = babelOptions.presets || [];

    let defaultPresets = createConfigItems("preset", [
      {
        name: "@babel/preset-env",
        targets: customOptions.targets,
        modules: false,
        loose: true,
      },
    ]);

    babelOptions.presets = mergeConfigItems(
      "preset",
      defaultPresets,
      babelOptions.presets
    );

    // Merge babelrc & our plugins together
    babelOptions.plugins = mergeConfigItems(
      "plugin",
      defaultPlugins,
      babelOptions.plugins || []
    );

    return babelOptions;
  },
}));

export async function buildPackage(packageName: string, packagePath: string) {
  let inputDir = path.join(paths.projectRoot, packagePath);
  let packageRoot = path.resolve(paths.projectRoot, packagePath, "..");
  let input = [
    // Prefer .tsx, fallback to .ts then .js
    fs.existsSync(path.join(inputDir, "index.tsx"))
      ? path.join(inputDir, "index.tsx")
      : fs.existsSync(path.join(inputDir, "index.ts"))
      ? path.join(inputDir, "index.ts")
      : path.join(inputDir, "index.js"),
  ];
  let name = packageName.split("/")[1];

  return await buildAction({ name, input, packageRoot });
}

export async function buildAction(packageDetails: {
  name: string;
  input: string[];
  packageRoot: string;
}) {
  let opts = await normalizeOpts({ ...packageDetails, ...parseArgs() });
  let buildConfigs = await createBuildConfigs(opts);
  let logger = await createProgressEstimator();

  try {
    // 1. Write the entry file
    await logger(
      writeCjsEntryFile(opts.name, opts.packageDist).catch(logError),
      "Creating entry file"
    );

    // 2. Build our modules
    await logger(
      new Promise((done) => {
        buildConfigs.forEach(async (inputOptions, index, src) => {
          let outputOptions = Array.isArray(inputOptions.output)
            ? inputOptions.output!
            : [inputOptions.output!].filter(Boolean);
          let bundle = await rollup(inputOptions);
          await Promise.all(outputOptions.map(bundle.write));

          // Resolve after the last package is built.
          if (index === src.length - 1) done();
        });
      }),
      "Building modules"
    );

    // 3. Move misplaced TypeScript definition files
    // https://github.com/ezolenko/rollup-plugin-typescript2/issues/136
    await logger(
      moveDeclarationFilesToDist(opts.packageRoot, opts.packageDist),
      "Cleaning up TS definitions"
    );
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

////////////////////////////////////////////////////////////////////////////////

function createConfigItems(type: any, items: any[]) {
  return items.map(({ name, ...options }) => {
    return createConfigItem([require.resolve(name), options], { type });
  });
}

function mergeConfigItems(type: any, ...configItemsToMerge: any[]) {
  let mergedItems: any[] = [];

  configItemsToMerge.forEach((configItemToMerge) => {
    configItemToMerge.forEach((item: any) => {
      let itemToMergeWithIndex = mergedItems.findIndex(
        (mergedItem) => mergedItem.file.resolved === item.file.resolved
      );

      if (itemToMergeWithIndex === -1) {
        mergedItems.push(item);
        return;
      }

      mergedItems[itemToMergeWithIndex] = createConfigItem(
        [
          mergedItems[itemToMergeWithIndex].file.resolved,
          merge(mergedItems[itemToMergeWithIndex].options, item.options),
        ],
        {
          type,
        }
      );
    });
  });

  return mergedItems;
}

export function writeCjsEntryFile(name: string, packageDist: string) {
  let contents = `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${name}.cjs.production.min.js');
} else {
  module.exports = require('./${name}.cjs.development.js');
}`;

  return fs.outputFile(path.join(packageDist, "index.js"), contents);
}

export async function createBuildConfigs(
  opts: NormalizedOpts
): Promise<RollupOptions[]> {
  let allInputs = flatten(
    flatten(opts.input as any).map((input: string) =>
      createAllFormats(opts, input).map(
        (options: ScriptOpts, index: number) => ({
          ...options,
          // We want to know if this is the first run for each entryfile
          // for certain plugins (e.g. css)
          writeMeta: index === 0,
        })
      )
    )
  );

  return await Promise.all(
    allInputs.map(async (options: ScriptOpts, index) => {
      return await createRollupConfig(options, index);
    })
  );
}

function createAllFormats(
  opts: NormalizedOpts,
  input: string
): [ScriptOpts, ...ScriptOpts[]] {
  return [
    {
      ...opts,
      format: "cjs",
      env: "development",
      input,
    },
    {
      ...opts,
      format: "cjs",
      env: "production",
      input,
    },
    { ...opts, format: "esm", input },
  ].filter(Boolean) as [ScriptOpts, ...ScriptOpts[]];
}

/**
 * The Typescript rollup plugin let's tsc handle dumping the declaration file.
 * Ocassionally its methods for determining where to dump it results in it
 * ending up in a sub-directory rather than adjacent to the bundled code, which
 * we don't want. Unclear exactly why, but this script moves it back after
 * Rollup is done.
 * @see https://github.com/ezolenko/rollup-plugin-typescript2/issues/136
 * @param packageName
 * @param packageRoot
 * @param packageDist
 */
async function moveDeclarationFilesToDist(
  packageRoot: string,
  packageDist: string
) {
  try {
    let packageRelativePath = path.relative(paths.packages, packageRoot);
    let misplacedDeclarationFilesRoot = path.join(
      packageDist,
      packageRelativePath,
      "src"
    );

    // Copy the type declarations and delete the leftover directory
    await fs.copy(misplacedDeclarationFilesRoot, packageDist);
    let relativeDirToDelete = path.resolve(misplacedDeclarationFilesRoot, "..");

    // Make sure what we're deleting is nested inside the dist directory before
    // we continue.
    if (
      relativeDirToDelete !== packageDist &&
      dirIsParentOf(packageDist, relativeDirToDelete)
    ) {
      await fs.remove(relativeDirToDelete);
    }
  } catch (e) {
    //
  }
}
