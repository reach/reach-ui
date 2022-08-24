import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";
import { alias } from "./test/alias";

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve: {
		alias,
	},
	define: {
		__DEV__: true,
	},
	test: {
		environment: "jsdom",
		coverage: {
			include: ["packages/*/__tests__/**/*.{ts,tsx,js,jsx}"],
			exclude: [...configDefaults.exclude],
		},
		setupFiles: ["./test/setupTests.ts"],
	},
});
