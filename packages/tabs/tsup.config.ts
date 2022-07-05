import { getTsupConfig, getPackageInfo } from "@reach-internal/dev";
import type { TsupConfig } from "@reach-internal/dev/types";

let { name: packageName, version: packageVersion } = getPackageInfo(__dirname);
let cfg: TsupConfig = getTsupConfig("src/index.tsx", {
  packageName,
  packageVersion,
});
export default cfg;
