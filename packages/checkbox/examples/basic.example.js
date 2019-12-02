/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Basic Mixed";

export function Example() {
  const [checked, setChecked] = React.useState(false);
  return (
    <div>
      <MixedCheckbox
        id="whatever-input"
        value="whatever"
        checked={checked}
        onChange={event => {
          setChecked(event.target.checked);
        }}
      />
      <label htmlFor="whatever-input">
        You must control the state WHATTTTTT
      </label>
      <button onClick={() => setChecked(!checked)}>
        Toggle that checkbox baby
      </button>
      <button onClick={() => setChecked("mixed")}>Mix it up</button>
    </div>
  );
}
