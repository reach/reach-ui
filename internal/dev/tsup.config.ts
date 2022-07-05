import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["internal-dev.ts"],
    format: "cjs",
    outExtension: () => ({ js: `.cjs` }),
  },
]);
