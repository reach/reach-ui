import { resolveApp } from "./utils";
import path from "path";

const projectRoot = path.resolve(__dirname, "../");

export const paths = {
  projectRoot,
  packagePackageJson: resolveApp("package.json"),
  packageTsconfigBuildJson: resolveApp("tsconfig.build.json"),
  testsSetup: path.join(projectRoot, "test/setupTests.ts"),
  packageRoot: resolveApp("."),
  packageDist: resolveApp("dist"),
  projectCache: path.join(projectRoot, ".cache"),
  progressEstimatorCache: path.join(
    projectRoot,
    "node_modules/.cache/.progress-estimator"
  ),
};
