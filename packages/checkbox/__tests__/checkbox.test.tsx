import React, { useState } from "react";
import { axe } from "jest-axe";
import {
  MixedCheckbox,
  CustomCheckboxContainer,
  CustomCheckboxInput,
  CustomCheckboxInputProps,
} from "@reach/checkbox";
import { render, fireEvent, act } from "$test/utils";

describe("<MixedCheckbox />", () => {
  it("should not have basic a11y issues", async () => {
    let { container, getByTestId } = render(<BasicMixedCheckbox />);

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();

      fireEvent.click(getByTestId("checkbox"));
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // TODO: Write tests for mixed checkbox
});

describe("<CustomCheckbox />", () => {
  it("should not have basic a11y issues", async () => {
    let { container, getByTestId } = render(<BasicCustomCheckbox />);

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();

      fireEvent.click(getByTestId("checkbox-1"));
      expect(await axe(container)).toHaveNoViolations();

      fireEvent.click(getByTestId("checkbox-2"));
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  // TODO: Write tests for custom checkbox
});

function BasicMixedCheckbox() {
  const [checked, setChecked] = useState<boolean | "mixed">(true);
  return (
    <div>
      <MixedCheckbox
        data-testid="checkbox"
        id="whatever-input"
        value="whatever"
        checked={checked}
        onChange={event => {
          setChecked(event.target.checked);
        }}
      />
      <label htmlFor="whatever-input">My mixed checkbox</label>
      <button onClick={() => setChecked(!checked)}>Toggle</button>
      <button onClick={() => setChecked("mixed")}>Mix</button>
    </div>
  );
}

function BasicCustomCheckbox() {
  return (
    <div>
      <label>
        <MyCustomCheckbox data-testid="checkbox-1" value="whatever" />
        Some very cool boxes, eh?
      </label>
      <br />
      <label>
        <MyCustomCheckbox
          data-testid="checkbox-2"
          checked="mixed"
          value="something-else"
        />
        I'm of mixed mind. It's not gonna change, no matter how hard you try!
      </label>
    </div>
  );
}

function MyCustomCheckbox({
  checked: checkedProp,
  ...props
}: CustomCheckboxInputProps & { checked?: boolean | "mixed" }) {
  const [checkedState, setChecked] = useState<typeof checkedProp>(
    checkedProp || false
  );
  const checked = checkedProp != null ? checkedProp : checkedState;
  return (
    <CustomCheckboxContainer
      checked={checked}
      onChange={event => setChecked(event.target.checked)}
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
