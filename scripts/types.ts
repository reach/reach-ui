import { CompilerOptions } from "typescript";

export interface SharedOpts {
  target: "node" | "browser";
  tsconfig?: string;
}

export type ModuleFormat = "cjs" | "umd" | "esm" | "system";

export interface BuildOpts extends SharedOpts {
  name?: string;
  target: "browser";
}

export interface WatchOpts extends BuildOpts {}

export interface NormalizedOpts extends Omit<BuildOpts, "name" | "target"> {
  name: string;
  input: string[];
  target?: "node" | "browser";
  packageRoot: string;
  packageDist: string;
  packageSrc: string;
}

export interface ScriptOpts extends Omit<NormalizedOpts, "input"> {
  input: string;
  env: "development" | "production";
  format: ModuleFormat;
  minify?: boolean;
  writeMeta?: boolean;
  transpileOnly?: boolean;
}

export type TSConfigJSON = {
  files?: string[];
  exclude?: string[];
  include?: string[];
  compileOnSave?: boolean;
  extends?: string;
  compilerOptions: CompilerOptions;
};

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
