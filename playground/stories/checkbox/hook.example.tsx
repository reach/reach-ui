import * as React from "react";
import { useMixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

let name = "With useMixedCheckbox hook";

function Example() {
  const [checked, setChecked] = React.useState<boolean | "mixed">(true);
  let inputRef = React.useRef(null);
  let [inputProps] = useMixedCheckbox(inputRef, {
    checked,
    onChange: (event) => setChecked(event.target.checked),
  });
  return (
    <div>
      <label>
        <input {...inputProps} ref={inputRef} />
        How about this cool example?
      </label>
      <button onClick={() => setChecked("mixed")}>Mix it up</button>
    </div>
  );
}

Example.storyName = name;
export { Example };
