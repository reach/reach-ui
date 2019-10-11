import "../styles.css";
import React, { useState, useMemo, useRef } from "react";
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

export const name = "Controlled";

export function Example() {
  const [term, setTerm] = useState("");
  const [selection, setSelection] = useState("");
  const results = useCityMatch(term);
  const ref = useRef();

  const handleChange = event => {
    setTerm(event.target.value);
  };

  const handleSelect = value => {
    setSelection(value);
    setTerm("");
  };

  return (
    <div>
      <h2>Clientside Search</h2>
      <p>Selection: {selection}</p>
      <p>Term: {term}</p>
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          ref={ref}
          value={term}
          onChange={handleChange}
          autocomplete={false}
          style={{ width: 400 }}
        />
        {results && (
          <ComboboxPopover>
            {results.length === 0 && (
              <p>
                No Results{" "}
                <button
                  onClick={() => {
                    console.log("YOOOOOO");
                    setTerm("");
                    ref.current.focus();
                  }}
                >
                  clear
                </button>
              </p>
            )}
            <ComboboxList>
              {results.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  value={`${result.city}, ${result.state}`}
                />
              ))}
            </ComboboxList>
            <p>
              <a href="/new">Add a record</a>
            </p>
          </ComboboxPopover>
        )}
      </Combobox>
    </div>
  );
}

function useCityMatch(term) {
  const throttledTerm = useThrottle(term, 100);
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
