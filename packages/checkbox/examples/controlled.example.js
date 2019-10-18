import React from "react";
import { Checkbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Controlled";

export function Example() {
  const [state, setState] = React.useState(false);
  return (
    <div>
      <Checkbox
        as="div"
        value="whatever"
        label="You can control the state WHATTTTTT"
        checked={state}
        onChange={event => {
          const { checked } = event.target;
          setState(checked);
        }}
      />
      <button onClick={() => setState(!state)}>
        Toggle that checkbox baby
      </button>
    </div>
  );
}
