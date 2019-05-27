import "./styles.css";
import React from "react";
import path from "path";
import { configure } from "@storybook/react";
import { getStorybook, storiesOf } from "@storybook/react";

let getPackageName = filePath =>
  path
    .dirname(filePath)
    .split(path.sep)
    .reverse()[1];

configure(() => {
  // Story book is SUPER SLOW so I tend to do just one example at a time.
  // const {
  //   name,
  //   Example
  // } = require("../packages/combobox/examples/no-popover.example.js");
  // storiesOf("Combobox", module).add(name, () => <Example />);

  // Automatically import all examples
  const req = require.context(
    "../packages",
    true,
    /^((?!node_modules).)*\.example\.js$/
  );

  req.keys().forEach(pathToExample => {
    const { name, Example } = req(pathToExample);
    storiesOf(getPackageName(pathToExample), module).add(name, () => (
      <Example />
    ));
  });
}, module);

export { getStorybook };
