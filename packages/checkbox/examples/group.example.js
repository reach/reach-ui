import React from "react";
import { MixedCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Grouped";

export function Example() {
  return (
    <fieldset>
      <legend>This is a very important question</legend>
      <label>
        <MixedCheckbox name="nonsense" value="whatever" />
        <span>Whaaaa</span>
      </label>
      <label>
        <MixedCheckbox name="nonsense" value="awesome" defaultChecked />
        <span>Awesome</span>
      </label>
      <label>
        <MixedCheckbox name="nonsense" value="nice" />
        <span>Very very Nice</span>
      </label>
    </fieldset>
  );
}
