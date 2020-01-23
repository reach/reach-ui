import React from "react";
import path from "path";
import { configure } from "@storybook/react";
import { getStorybook, storiesOf } from "@storybook/react";
import "./styles.css";
import "pepjs";

export default {
  stories: ["../packages/**/src/**/*.stories.[tj]s"],
  addons: [
    "@storybook/addon-actions/register",
    "@storybook/addon-links/register"
  ]
};
