import { DEFAULT_EXTENSIONS, createConfigItem } from "@babel/core";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import asyncro from "asyncro";
import { merge } from "lodash";
import path from "path";
import { rollup, RollupOptions, OutputOptions } from "rollup";
import babelPlugin from "rollup-plugin-babel";
import sourceMaps from "rollup-plugin-sourcemaps";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { paths } from "./constants";
import { extractErrors } from "./errors/extractErrors";
import {
  createProgressEstimator,
  external,
  // getInputs,
  // isDir,
  // isFile,
  isTruthy,
  // jsOrTs,
  normalizeOpts,
  safePackageName,
  safeVariableName,
  concatAllArray,
  logError,
  cleanDistFolder,
  parseArgs,
} from "./utils";
import { ScriptOpts, NormalizedOpts } from "./types";
import * as fs from "fs-extra";

const replacements = [{ original: "lodash", replacement: "lodash-es" }];

const errorCodeOpts = {
  errorMapFilePath: paths.appErrorsJson,
};

// shebang cache map thing because the transform only gets run once
let shebang: any = {};

export async function createRollupConfig(
  opts: ScriptOpts
): Promise<RollupOptions> {
  const findAndRecordErrorCodes = await extractErrors({
    ...errorCodeOpts,
    ...opts,
  });

  const shouldMinify =
    opts.minify !== undefined ? opts.minify : opts.env === "production";

  const outputName = [
    `${paths.appDist}/${safePackageName(opts.name)}`,
    opts.format,
    opts.env,
    shouldMinify ? "min" : "",
    "js",
  ]
    .filter(Boolean)
    .join(".");

  let tsconfigJSON;
  try {
    tsconfigJSON = await fs.readJSON(opts.tsconfig || paths.tsconfigJson);
  } catch (e) {}

  return {
    // Tell Rollup the entry point to the package
    input: opts.input,
    // Tell Rollup which packages to ignore
    external: (id: string) => {
      if (id === "babel-plugin-transform-async-to-promises/helpers") {
        return false;
      }
      return external(id);
    },
    // Rollup has treeshaking by default, but we can optimize it further...
    treeshake: {
      // We assume reading a property of an object never has side-effects.
      // This means we WILL remove getters and setters defined directly on objects.
      // Any getters or setters defined on classes will not be effected.
      //
      // @example
      //
      // const foo = {
      //  get bar() {
      //    console.log('effect');
      //    return 'bar';
      //  }
      // }
      //
      // const result = foo.bar;
      // const illegalAccess = foo.quux.tooDeep;
      //
      // Punchline....Don't use getters and setters
      propertyReadSideEffects: false,
    },
    // Establish Rollup output
    output: {
      // Set filenames of the consumer's package
      file: outputName,
      // Pass through the file format
      format: opts.format,
      // Do not let Rollup call Object.freeze() on namespace import objects
      // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
      freeze: false,
      // Respect tsconfig esModuleInterop when setting __esModule.
      esModule: tsconfigJSON ? tsconfigJSON.esModuleInterop : false,
      name: opts.name || safeVariableName(opts.name),
      sourcemap: true,
      globals: { react: "React", "react-native": "ReactNative" },
      exports: "named",
    },
    plugins: [
      !!opts.extractErrors && {
        async transform(source: any) {
          await findAndRecordErrorCodes(source);
          return source;
        },
      },
      resolve({
        mainFields: [
          "module",
          "main",
          opts.target !== "node" ? "browser" : undefined,
        ].filter(Boolean) as string[],
      }),
      opts.format === "umd" &&
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
        cacheRoot: `./.cache/build/${opts.format}/`,
        tsconfig: opts.tsconfig,
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
            paths.appDist,
          ],
          compilerOptions: {
            sourceMap: true,
            declaration: true,
            jsx: "react",
          },
        },
        tsconfigOverride: {
          compilerOptions: {
            // TS -> esnext, then leave the rest to babel-preset-env
            target: "esnext",
          },
        },
        check: !opts.transpileOnly,
      }),
      babelPluginReach({
        exclude: "node_modules/**",
        extensions: [...DEFAULT_EXTENSIONS, "ts", "tsx"],
        passPerPreset: true,
        custom: {
          targets: opts.target === "node" ? { node: "8" } : undefined,
          extractErrors: opts.extractErrors,
          format: opts.format,
          // defines: opts.defines,
        },
      }),
      opts.env !== undefined &&
        replace({
          "process.env.NODE_ENV": JSON.stringify(opts.env),
        }),
      sourceMaps(),
      // sizeSnapshot({
      //   printInfo: false,
      // }),
      shouldMinify &&
        terser({
          sourcemap: true,
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
            passes: 10,
          },
          ecma: 5,
          toplevel: opts.format === "cjs",
          warnings: true,
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
    const defaultPlugins = createConfigItems(
      "plugin",
      [
        // {
        //   name: '@babel/plugin-transform-react-jsx',
        //   pragma: customOptions.jsx || 'h',
        //   pragmaFrag: customOptions.jsxFragment || 'Fragment',
        // },
        { name: "babel-plugin-annotate-pure-calls" },
        { name: "babel-plugin-dev-expression" },
        customOptions.format !== "cjs" && {
          name: "babel-plugin-transform-rename-import",
          replacements,
        },
        isTruthy(customOptions.defines) && {
          name: "babel-plugin-transform-replace-expressions",
          replace: customOptions.defines,
        },
        {
          name: "babel-plugin-transform-async-to-promises",
          inlineHelpers: true,
          externalHelpers: true,
        },
        {
          name: "@babel/plugin-proposal-class-properties",
          loose: true,
        },
        // Adds syntax support for optional chaining (.?)
        { name: "@babel/plugin-proposal-optional-chaining" },
        // Adds syntax support for default value using ?? operator
        { name: "@babel/plugin-proposal-nullish-coalescing-operator" },
        {
          name: "@babel/plugin-transform-regenerator",
          async: false,
        },
        {
          name: "babel-plugin-macros",
        },
        isTruthy(customOptions.extractErrors) && {
          name: "./errors/transformErrorMessages",
        },
      ].filter(Boolean)
    );

    const babelOptions = config.options || {};
    babelOptions.presets = babelOptions.presets || [];

    const envIdx = babelOptions.presets.findIndex((preset: any) =>
      preset.file.request.includes("@babel/preset-env")
    );

    // if they use preset-env, merge their options with ours
    if (envIdx !== -1) {
      const preset = babelOptions.presets[envIdx];
      babelOptions.presets[envIdx] = createConfigItem(
        [
          preset.file.resolved,
          merge(
            {
              loose: true,
              targets: customOptions.targets,
            },
            preset.options,
            {
              modules: false,
              exclude: merge(
                ["transform-async-to-generator", "transform-regenerator"],
                (preset.options && preset.options.exclude) || []
              ),
            }
          ),
        ],
        {
          type: `preset`,
        }
      );
    } else {
      // if no preset-env, add it & merge with their presets
      const defaultPresets = createConfigItems("preset", [
        {
          name: "@babel/preset-env",
          targets: customOptions.targets,
          modules: false,
          loose: true,
          exclude: ["transform-async-to-generator", "transform-regenerator"],
        },
      ]);

      babelOptions.presets = mergeConfigItems(
        "preset",
        defaultPresets,
        babelOptions.presets
      );
    }

    // Merge babelrc & our plugins together
    babelOptions.plugins = mergeConfigItems(
      "plugin",
      defaultPlugins,
      babelOptions.plugins || []
    );

    return babelOptions;
  },
}));

async function buildAction() {
  const opts = await normalizeOpts(parseArgs());
  const buildConfigs = await createBuildConfigs(opts);
  await cleanDistFolder();
  const logger = await createProgressEstimator();
  if (opts.format.includes("cjs")) {
    const promise = writeCjsEntryFile(opts.name).catch(logError);
    logger(promise, "Creating entry file");
  }
  try {
    const promise = asyncro
      .map(buildConfigs, async (inputOptions: RollupOptions) => {
        let bundle = await rollup(inputOptions);
        await bundle.write(inputOptions.output as OutputOptions);
      })
      .catch((e: any) => {
        throw e;
      });
    logger(promise, "Building modules");
    await promise;
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

buildAction();

////////////////////////////////////////////////////////////////////////////////

function createConfigItems(type: any, items: any[]) {
  return items.map(({ name, ...options }) => {
    return createConfigItem([require.resolve(name), options], { type });
  });
}

function mergeConfigItems(type: any, ...configItemsToMerge: any[]) {
  const mergedItems: any[] = [];

  configItemsToMerge.forEach(configItemToMerge => {
    configItemToMerge.forEach((item: any) => {
      const itemToMergeWithIndex = mergedItems.findIndex(
        mergedItem => mergedItem.file.resolved === item.file.resolved
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

export function writeCjsEntryFile(name: string) {
  const baseLine = `module.exports = require('./${safePackageName(name)}`;
  const contents = `
'use strict'

if (process.env.NODE_ENV === 'production') {
  ${baseLine}.cjs.production.min.js')
} else {
  ${baseLine}.cjs.development.js')
}
`;
  return fs.outputFile(path.join(paths.appDist, "index.js"), contents);
}

export async function createBuildConfigs(
  opts: NormalizedOpts
): Promise<Array<RollupOptions>> {
  const allInputs = concatAllArray(
    opts.input.map((input: string) =>
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
    allInputs.map(async (options: ScriptOpts) => {
      return await createRollupConfig(options);
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
    // {
    //   ...opts,
    //   format: "umd",
    //   env: "development",
    //   input,
    // },
    // {
    //   ...opts,
    //   format: "umd",
    //   env: "production",
    //   input,
    // },
    // {
    //   ...opts,
    //   format: "system",
    //   env: "development",
    //   input,
    // },
    // {
    //   ...opts,
    //   format: "system",
    //   env: "production",
    //   input,
    // },
  ].filter(Boolean) as [ScriptOpts, ...ScriptOpts[]];
}
