/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import { CustomCheckboxContainer, CustomCheckboxInput } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

let name = "CustomCheckbox Composed";

function MyCheckbox(props) {
  const [checkedState, setChecked] = React.useState(props.checked || false);
  const checked = props.checked != null ? props.checked : checkedState;
  return (
    <CustomCheckboxContainer
      checked={props.checked != null ? props.checked : checked}
      onChange={(event) => setChecked(event.target.checked)}
      style={{
        background: "rgba(240, 240, 250, 0.8)",
        border: "2px solid rgba(0, 0, 0, 0.8)",
        borderRadius: "3px",
        height: 26,
        width: 26,
      }}
    >
      <CustomCheckboxInput {...props} />
      <span
        aria-hidden
        style={{
          display: "block",
          position: "absolute",
          width: "60%",
          height: "60%",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scaleX(${
            !!checked ? 1 : 0
          }) scaleY(${checked === true ? 1 : checked === "mixed" ? 0.4 : 0})`,
          transition: "transform 200ms ease-out, background 200ms ease-out",
          zIndex: 1,
          background:
            checked === true
              ? "green"
              : checked === "mixed"
              ? "goldenrod"
              : "transparent",
        }}
      />
    </CustomCheckboxContainer>
  );
}

function Example() {
  return (
    <div>
      <label>
        <MyCheckbox value="whatever" />
        Some very cool boxes, eh?
      </label>
      <br />
      <label>
        <MyCheckbox checked="mixed" value="something-else" />
        I'm of mixed mind. It's not gonna change, no matter how hard you try!
      </label>
    </div>
  );
}

Example.storyName = name;
export { Example };
