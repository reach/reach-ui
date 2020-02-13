import React, { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxPopover,
  ComboboxOption,
  ComboboxButton,
} from "@reach/combobox";
import VisuallyHidden from "@reach/visually-hidden";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";
import cities from "./cities";
import "@reach/combobox/styles.css";

let name = "With Button";

function Example() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  function handleChange(event) {
    setTerm(event.target.value);
  }

  return (
    <div>
      <h2>No Portal</h2>
      <Combobox>
        <ComboboxInput style={{ width: "300px" }} onChange={handleChange} />
        <ComboboxButton>
          <VisuallyHidden>Toggle the list of cities</VisuallyHidden>
          <span aria-hidden>▾</span>
        </ComboboxButton>
        <ComboboxPopover>
          <ComboboxList>
            {results.slice(0, 10).map((result, index) => (
              <ComboboxOption
                key={index}
                value={`${result.city}, ${result.state}`}
              />
            ))}
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

function useCityMatch(term) {
  let throttledTerm = useThrottle(term, 100);
  return useMemo(
    () =>
      throttledTerm.trim() === ""
        ? null
        : matchSorter(cities, throttledTerm, {
            keys: [item => `${item.city}, ${item.state}`],
          }),
    [throttledTerm]
  );
}
