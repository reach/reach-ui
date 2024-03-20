import type { Meta, StoryObj } from "@storybook/react";
import { default as Basic } from "./basic.example.js";

const meta = {
	title: "AlertDialog",
	argTypes: {},
} satisfies Meta<AlertDialogStoryArgs>;

export type AlertDialogStoryArgs = {};
export type AlertDialogStory = StoryObj<typeof meta>;
export default meta;
export { Basic };
