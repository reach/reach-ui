/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Custom with Pseudo Styling";

export function Example() {
  return (
    <div>
      <label>
        <CustomCheckbox value="whatever" defaultChecked={true} />
        All pseudos here
      </label>
      <br />
      <label>
        <CustomCheckbox
          checked="mixed"
          value="something-else"
          onChange={() => ({})}
        />
        Just a lonely mixed box
      </label>
    </div>
  );
}
