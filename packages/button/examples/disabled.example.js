import React from "react";
import Button from "../src/index";

export let name = "Disabled";

export const Example = () => {
  return <Button disabled={true} title="Hello World" />;
};
