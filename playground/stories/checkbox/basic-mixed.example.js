import * as React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

let name = "Basic MixedCheckbox";

function Example() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div>
      <div>
        <label>
          <MixedCheckbox checked="mixed" />
          Perma-mixed
        </label>
      </div>
      <div>
        <MixedCheckbox
          id="whatever-input"
          value="whatever"
          checked={checked}
          onChange={(event) => {
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
    </div>
  );
}

Example.storyName = name;
export { Example };
