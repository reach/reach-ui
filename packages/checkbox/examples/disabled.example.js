/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

const name = "Disabled";

function Example() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>
          <input
            type="checkbox"
            disabled
            checked={checked}
            onChange={event => {
              setChecked(event.target.checked);
            }}
          />
          Plain ol' checkbox
        </label>
        <label>
          <MixedCheckbox
            disabled
            value="whatever"
            checked={checked}
            onChange={event => {
              setChecked(event.target.checked);
            }}
          />
          Controlled but disabled
        </label>
        <label>
          <MixedCheckbox disabled value="ok" checked="mixed" />
          Just a mixed box
        </label>
        <label>
          <MixedCheckbox disabled />
          Uncontrolled
        </label>
        <label>
          <MixedCheckbox disabled defaultChecked />
          Uncontrolled, defaultChecked
        </label>
      </div>
      <button onClick={() => setChecked(!checked)}>Checkbox don't care</button>
      <pre>{JSON.stringify({ checked })}</pre>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Checkbox" };
