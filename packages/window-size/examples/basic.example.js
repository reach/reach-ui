import React from "react";
import WindowSize from "../index";

export let name = "Basic";

export let Example = () => (
  <WindowSize>
    {sizes => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
  </WindowSize>
);
