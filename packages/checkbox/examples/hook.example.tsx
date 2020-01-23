import React, { useRef } from "react";
import { useMixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "With useMixedCheckbox hook";

export function Example() {
  const [checked, setChecked] = React.useState<boolean | "mixed">(true);
  let inputRef1 = useRef(null);
  let inputRef2 = useRef(null);
  let [controlledInputProps, outputRef1] = useMixedCheckbox(inputRef1, {
    checked
  });
  let [uncontrolledInputProps, outputRef2] = useMixedCheckbox(inputRef2);
  return (
    <div>
      <label>
        <input
          {...controlledInputProps}
          ref={outputRef1}
          onChange={event => setChecked(event.target.checked)}
        />
        How about this controlled example?
      </label>
      <label>
        <input ref={outputRef2} {...uncontrolledInputProps} />
        How about this <strong>uncontrolled</strong> example?
      </label>
      <button onClick={() => setChecked("mixed")}>Mix it up</button>
    </div>
  );
}
