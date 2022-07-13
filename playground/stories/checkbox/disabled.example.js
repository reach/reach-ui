import * as React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

const name = "Disabled MixedCheckbox";

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
            onChange={(event) => {
              setChecked(event.target.checked);
            }}
          />
          Plain ol' checkbox, controlled (should update only by clicking the
          button below)
        </label>
        <label>
          <MixedCheckbox
            disabled
            value="whatever"
            checked={checked}
            onChange={(event) => {
              setChecked(event.target.checked);
            }}
          />
          Controlled mixed (should update only by clicking the button below)
        </label>
        <label>
          <MixedCheckbox disabled value="ok" checked="mixed" />
          Just a static mixed box
        </label>
        <label>
          <MixedCheckbox disabled />
          Uncontrolled mixed box
        </label>
        <label>
          <MixedCheckbox disabled defaultChecked />
          Uncontrolled, defaultChecked mixed box
        </label>
      </div>
      <button onClick={() => setChecked(!checked)}>Checkbox don't care</button>
      <pre>{JSON.stringify({ checked })}</pre>
    </div>
  );
}

Example.storyName = name;
export { Example };
