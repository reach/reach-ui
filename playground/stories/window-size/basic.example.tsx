import * as React from "react";
import WindowSize from "@reach/window-size";

let name = "Basic (TS)";

function Example() {
  return (
    <WindowSize>
      {(sizes) => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
    </WindowSize>
  );
}

Example.storyName = name;
export { Example };
