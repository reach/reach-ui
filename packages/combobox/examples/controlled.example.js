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

export let name = "Controlled";

export function Example() {
  let [term, setTerm] = useState("");
  let [selection, setSelection] = useState("");
  let results = useCityMatch(term);
  let ref = useRef();

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
