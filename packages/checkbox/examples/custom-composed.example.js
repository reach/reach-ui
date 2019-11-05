/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { CustomCheckboxContainer, CustomCheckboxInput } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Custom Composed";

const MyCheckbox = props => {
  return (
    <CustomCheckboxContainer
      style={{
        border: "2px solid red",
        height: 26,
        width: 26
      }}
    >
      {({ checked }) => (
        <>
          <CustomCheckboxInput {...props} />
          <span
            aria-hidden
            style={{
              display: "block",
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1,
              background:
                checked === true
                  ? "green"
                  : checked === "mixed"
                  ? "yellow"
                  : "transparent"
            }}
          />
        </>
      )}
    </CustomCheckboxContainer>
  );
};

export function Example() {
  return (
    <div>
      <label>
        <MyCheckbox value="whatever" defaultChecked={true} />
        Some very ugly boxes, eh?
      </label>
      <br />
      <label>
        <MyCheckbox
          checked="mixed"
          value="something-else"
          onChange={() => ({})}
        />
        Not gonna change, no matter how hard you try!
      </label>
    </div>
  );
}
