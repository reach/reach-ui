import path from "path";

export const projectRoot = path.resolve(__dirname, "../");

export const paths = {
  projectRoot,
  packages: path.join(projectRoot, "packages"),
  testsSetup: path.join(projectRoot, "test/setupTests.ts"),
  projectCache: path.join(projectRoot, ".cache"),
  progressEstimatorCache: path.join(
    projectRoot,
    "node_modules/.cache/.progress-estimator"
  ),
};
