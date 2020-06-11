import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
  ComboboxInputProps,
  useComboboxContext,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

let name = "With useComboboxContext (TS)";

const StyledComboboxInput = (props: ComboboxInputProps) => {
  const { isExpanded } = useComboboxContext();

  return (
    <ComboboxInput
      {...props}
      style={{
        width: 400,
        fontSize: "100%",
        padding: "0.33rem",
        backgroundColor: isExpanded ? "cornsilk" : "aliceblue",
      }}
    />
  );
};

function Example() {
  return (
    <div>
      <h2 id="choose-a-fruit">Choose a fruit</h2>
      <p>Input styles change based on popover visibility!</p>
      <Combobox>
        <StyledComboboxInput aria-labelledby="choose-a-fruit" />
        <ComboboxPopover style={popupStyle}>
          <ComboboxList>
            <ComboboxOption value="Apple" />
            <ComboboxOption value="Banana" />
            <ComboboxOption value="Orange" />
            <ComboboxOption value="Pineapple" />
            <ComboboxOption value="Kiwi" />
            <button>Hi</button>
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Combobox" };

////////////////////////////////////////////////////////////////////////////////

const popupStyle = {
  boxShadow: "0px 2px 6px hsla(0, 0%, 0%, 0.15)",
  border: "none",
};
