import React from "react";
import { MixedCheckbox, CheckboxGroup } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Grouped";

export function Example() {
  return (
    <CheckboxGroup
      name="nonsense"
      legend="This is a very important question"
      defaultCheckedStates={{
        whatever: false,
        awesome: true,
        nice: false
      }}
    >
      {({ checkedStates }) => (
        <>
          <label>
            <MixedCheckbox value="whatever" checked={checkedStates.whatever} />
            <span>Whaaaa</span>
          </label>
          <label>
            <MixedCheckbox value="awesome" checked={checkedStates.awesome} />
            <span>Awesome</span>
          </label>
          <label>
            <MixedCheckbox value="nice" checked={checkedStates.nice} />
            <span>Very very Nice</span>
          </label>
        </>
      )}
    </CheckboxGroup>
  );
}
