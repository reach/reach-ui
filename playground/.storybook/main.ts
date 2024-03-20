import type { StorybookConfig } from "@storybook/react-vite";
import fs from "node:fs";
import path from "node:path";

const config: StorybookConfig = {
	stories: [
		"../stories/alert/*.story.@(js|ts|tsx)",
		"../stories/alert-dialog/*.story.@(js|ts|tsx)",
		// TODO: Un-comment and remove lines above when all examples support new
		// story format
		// "../stories/**/*.story.@(js|ts|tsx)"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
};
export default config;

// const packagesDir = path.resolve(__dirname, "../../packages");
// const packages = fs.readdirSync(packagesDir);
