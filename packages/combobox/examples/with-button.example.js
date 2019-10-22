import "@reach/combobox/styles.css";

import React, { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxPopover,
  ComboboxOption,
  ComboboxButton
} from "@reach/combobox";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";

import cities from "./cities.js";

export let name = "With Button";

export function Example() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = event => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>No Portal</h2>
      <Combobox>
        <ComboboxInput style={{ width: "300px" }} onChange={handleChange} />
        <ComboboxButton aria-label="toggle menu">▾</ComboboxButton>
        {results && (
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
        )}
      </Combobox>
    </div>
  );
}

function useCityMatch(term) {
  let throttledTerm = useThrottle(term, 100);
  return useMemo(
    () =>
      term.trim() === ""
        ? null
        : matchSorter(cities, term, {
            keys: [item => `${item.city}, ${item.state}`]
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [throttledTerm]
  );
}
