import { defineConfig, configDefaults } from "vitest/config";
import type { UserConfig } from "vitest/config";
import tsconfigPaths from "vitest-tsconfig-paths";

let resolve: UserConfig["resolve"] = {};
if (process.env.USE_REACT_16 === "true") {
	resolve.alias = {
		react: "react-16",
		"react-dom": "react-dom-16",
		"react-is": "react-is-16",
	};
} else if (process.env.USE_REACT_18 === "true") {
	resolve.alias = {
		react: "react-18",
		"react-dom": "react-dom-18",
		"react-is": "react-is-18",
	};
}

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve,
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
