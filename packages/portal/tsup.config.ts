import type { defineConfig } from "tsup";
import { getTsupConfig, getPackageInfo } from "@reach-internal/dev/tsup.js";

type TsupConfig = ReturnType<typeof defineConfig>;

let { name: packageName, version: packageVersion } = getPackageInfo(
	// @ts-expect-error
	__dirname
);
let cfg: TsupConfig = getTsupConfig(`src/reach-portal.tsx`, {
	packageName,
	packageVersion,
});
export default cfg;
