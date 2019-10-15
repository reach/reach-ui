import React from "react";
import { useWindowSize } from "@reach/window-size";

export let name = "useWindowSize";

export let Example = () => {
  const sizes = useWindowSize();
  return (
    <pre>Window size (but with a hook): {JSON.stringify(sizes, null, 2)}</pre>
  );
};
