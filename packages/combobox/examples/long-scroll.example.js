import React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from "@reach/combobox";
import "@reach/combobox/styles.css";

export let name = "Scrollable Popover";

export function Example() {
  return (
    <div>
      <h4 id="demo">Basic, Fixed List Combobox</h4>
      <Combobox>
        <ComboboxInput aria-labelledby="demo" />
        <ComboboxPopover>
          <ComboboxList
            aria-labelledby="demo"
            style={{
              maxHeight: 150,
              overflow: "auto"
            }}
          >
            <ComboboxOption value="Apple" />
            <ComboboxOption value="Banana" />
            <ComboboxOption value="Orange" />
            <ComboboxOption value="Pineapple" />
            <ComboboxOption value="Kiwi" />
            <ComboboxOption value="Pomegranate" />
            <ComboboxOption value="Dragonfruit" />
            <ComboboxOption value="Lemon" />
            <ComboboxOption value="Lime" />
            <ComboboxOption value="Cherry" />
            <ComboboxOption value="Tomato" />
            <ComboboxOption value="Plum" />
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
