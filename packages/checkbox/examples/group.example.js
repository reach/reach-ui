import React from "react";
import { Checkbox, CheckboxGroup } from "@reach/checkbox";
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
          <Checkbox
            value="whatever"
            label="Whaaaa"
            checked={checkedStates.whatever}
          />
          <Checkbox
            value="awesome"
            label="Awesome"
            checked={checkedStates.awesome}
          />
          <Checkbox
            value="nice"
            label="Very very Nice"
            checked={checkedStates.nice}
          />
        </>
      )}
    </CheckboxGroup>
  );
}
