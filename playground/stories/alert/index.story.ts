import type { Meta, StoryObj } from "@storybook/react";
import { default as Basic } from "./basic.example.js";

const meta = {
	title: "Alert",
	argTypes: {},
} satisfies Meta<AlertStoryArgs>;

export type AlertStoryArgs = {};
export type AlertStory = StoryObj<typeof meta>;
export default meta;
export { Basic };
