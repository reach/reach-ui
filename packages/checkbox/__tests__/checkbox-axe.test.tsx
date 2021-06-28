import * as React from "react";
import {
  MixedCheckbox,
  CustomCheckboxContainer,
  CustomCheckboxInput,
  CustomCheckboxContainerProps,
  CustomCheckboxInputProps,
} from "@reach/checkbox";
import { render, fireEvent } from "$test/utils";

describe("<MixedCheckbox />", () => {
  it("Should not have ARIA violations after render", async () => {
    jest.useRealTimers();
    let { container } = render(<BasicMixedCheckbox />);
    await expect(container).toHaveNoAxeViolations();
  });

  it("Should not have ARIA violations after initial click", async () => {
    jest.useRealTimers();
    let { container, getByTestId } = render(<BasicMixedCheckbox />);
    fireEvent.click(getByTestId("checkbox"));
    await expect(container).toHaveNoAxeViolations();
  });
});

describe("<CustomCheckbox />", () => {
  it("Should not have ARIA violations after render", async () => {
    jest.useRealTimers();
    let { container } = render(<BasicCustomCheckbox />);
    await expect(container).toHaveNoAxeViolations();
  });

  it("Should not have ARIA violations after initial click (1)", async () => {
    jest.useRealTimers();
    let { container, getByTestId } = render(<BasicCustomCheckbox />);
    fireEvent.click(getByTestId("checkbox-1"));
    await expect(container).toHaveNoAxeViolations();
  });

  it("Should not have ARIA violations after initial click (2)", async () => {
    jest.useRealTimers();
    let { container, getByTestId } = render(<BasicCustomCheckbox />);
    fireEvent.click(getByTestId("checkbox-2"));
    await expect(container).toHaveNoAxeViolations();
  });
  // TODO: Write tests for custom checkbox
});

function BasicMixedCheckbox() {
  const [checked, setChecked] = React.useState<boolean | "mixed">(true);
  return (
    <div>
      <MixedCheckbox
        data-testid="checkbox"
        id="whatever-input"
        value="whatever"
        checked={checked}
        onChange={(event) => {
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
}: CustomCheckboxInputProps & Pick<CustomCheckboxContainerProps, "checked">) {
  const [checkedState, setChecked] = React.useState<typeof checkedProp>(
    checkedProp || false
  );
  const checked = checkedProp != null ? checkedProp : checkedState;
  return (
    <CustomCheckboxContainer
      checked={checked}
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
