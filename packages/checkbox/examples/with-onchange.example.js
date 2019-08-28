import React from "react";
import Checkbox from "../src/index";

export let name = "With onChange";

export const Example = () => {
  return (
    <Checkbox
      disabled={false}
      checked={true}
      onChange={(e, data) => console.log(e, data)}
      label="Checkbox"
    />
  );
};
