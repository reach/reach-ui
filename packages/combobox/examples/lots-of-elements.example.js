import "../styles.css";
import React, { useState, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from "../src/index";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";
import cities from "./cities";

export let name = "Lots of Elements";

export function Example() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = event => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>

      <Combobox>
        <ComboboxInput autocomplete={false} onChange={handleChange} />
        {results && (
          <ComboboxPopover>
            {results.length > 0 ? (
              <ComboboxList>
                <h3>top 3 results!</h3>
                {results.slice(0, 3).map((result, index) => (
                  <ComboboxOption
                    key={index}
                    value={`${result.city}, ${result.state}`}
                  />
                ))}
                {results.length > 3 && (
                  <React.Fragment>
                    <hr />
                    <h3>the other stuff</h3>
                    {results.slice(3, 10).map((result, index) => (
                      <ComboboxOption
                        key={index}
                        value={`${result.city}, ${result.state}`}
                      />
                    ))}
                  </React.Fragment>
                )}
              </ComboboxList>
            ) : (
              <p style={{ padding: "0 10px" }}>
                No results, peace be with you.
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
