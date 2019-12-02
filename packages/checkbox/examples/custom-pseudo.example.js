/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";
import "./custom-pseduo.css";

export const name = "Custom with Pseudo Element Styles";

export function Example() {
  const [checked, setChecked] = React.useState(false);
  return (
    <div className="pseudo-container">
      <label>
        <CustomCheckbox
          value="whatever"
          checked={checked}
          onChange={event => {
            setChecked(event.target.checked);
          }}
        />
        All pseudos here
      </label>
      <br />
      <label>
        <CustomCheckbox readOnly checked="mixed" value="something-else" />
        Just a lonely mixed box
      </label>
    </div>
  );
}
