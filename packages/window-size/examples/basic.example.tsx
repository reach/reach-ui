import React from "react";
import WindowSize from "@reach/window-size";

export let name = "Basic (TS)";

export function Example() {
  return (
    <WindowSize>
      {sizes => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
    </WindowSize>
  );
}
