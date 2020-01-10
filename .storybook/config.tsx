import React from "react";
import path from "path";
import { configure } from "@storybook/react";
import { getStorybook, storiesOf } from "@storybook/react";
import "./styles.css";
import "pepjs";

let getPackageName = (filePath: string) =>
  path
    .dirname(filePath)
    .split(path.sep)
    .reverse()[1];

configure(() => {
  // Automatically import all examples
  const req = require.context(
    "../packages",
    true,
    /^((?!node_modules).)*\.example\.(js|ts|tsx)$/
  );

  req.keys().forEach(pathToExample => {
    const { name, Example } = req(pathToExample);
    storiesOf(getPackageName(pathToExample), module).add(name, () => (
      <Example />
    ));
  });
}, module);

export { getStorybook };
