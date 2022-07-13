import type { TsupConfig } from "./types";

export function getTsupConfig(
  entry: string | string[],
  args: {
    packageName: string;
    packageVersion: string;
    external?: string[];
    define?: Record<string, string>;
  }
): TsupConfig;

export function getPackageInfo(packageRoot: string): {
  version: string;
  name: string;
};
