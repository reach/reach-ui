import React from "react";
import WindowSize from "../src/index";

export const name = "Basic";

export const Example = () => (
  <WindowSize>
    {sizes => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
  </WindowSize>
);
