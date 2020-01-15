import React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from "@reach/combobox";
import "@reach/combobox/styles.css";

export let name = "Overflow";

export function Example() {
  return (
    <div>
      <h2>Clientside Search</h2>
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
            <ComboboxOption value="Passionfruit" />
            <ComboboxOption value="Dragonfruit" />
            <ComboboxOption value="Strawberry" />
            <ComboboxOption value="Lime" />
            <ComboboxOption value="Lemon" />
            <ComboboxOption value="Fig" />
            <ComboboxOption value="Watermelon" />
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
