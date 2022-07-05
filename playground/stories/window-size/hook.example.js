import * as React from "react";
import { useWindowSize } from "@reach/window-size";

let name = "Basic (useWindowSize)";

function Example() {
  const sizes = useWindowSize();
  return (
    <pre>Window size (but with a hook): {JSON.stringify(sizes, null, 2)}</pre>
  );
}

Example.storyName = name;
export { Example };
