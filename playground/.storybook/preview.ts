import type { Preview } from "@storybook/react";

const preview: Preview = {
	parameters: {
		parameters: {
			layout: "centered",
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
