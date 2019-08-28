import React from "react";
import Checkbox from "../src/index";

export let name = "Basic";

export const Example = () => {
  return <Checkbox disabled={false} checked={true} label="Checkbox" />;
};
