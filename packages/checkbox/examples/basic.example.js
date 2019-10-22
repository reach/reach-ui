import React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Basic";

export function Example() {
  return (
    <div>
      <label>
        <input type="checkbox" value="plain-jane-input" name="ok" />
        <span>This is a plain input</span>
      </label>
      <label>
        <MixedCheckbox
          checked="mixed"
          readOnly
          value="readonly"
          name="readonly"
        />
        <span>Mixed + read only</span>
      </label>
    </div>
  );
}
