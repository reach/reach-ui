import React from "react";
import Checkbox from "../src/index";

export let name = "Without checked";

export const Example = () => {
  return <Checkbox disabled={false} label="Without checked" />;
};
