import "../styles.css";
import React, { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxPopover,
  ComboboxOption
} from "../src/index";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";
import cities from "./cities";

export let name = "No Popover";

export function Example() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = event => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>No Portal</h2>
      <Combobox style={{ width: "400px" }}>
        <ComboboxInput onChange={handleChange} />
        {results && (
          <ComboboxPopover portal={false}>
            <hr />
            {results.length > 0 ? (
              <ComboboxList>
                {results.slice(0, 10).map((result, index) => (
                  <ComboboxOption
                    key={index}
                    value={`${result.city}, ${result.state}`}
                  />
                ))}
              </ComboboxList>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "#454545",
                  padding: "0.25rem 1rem 0.75rem 1rem",
                  fontStyle: "italic"
                }}
              >
                No results :(
              </p>
            )}
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
    [throttledTerm]
  );
}
