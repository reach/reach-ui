import React, { useState, useMemo, useRef } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";
import cities from "./cities";
import "@reach/combobox/styles.css";

let name = "ComboboxOption id in onSelect data";

function Example() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = (event) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>
      <Combobox
        id="holy-smokes"
        onSelect={(value, id) => alert(`Selected ${id} with value ${value}`)}
      >
        <ComboboxInput onChange={handleChange} style={inputStyle} />
        {results && (
          <ComboboxPopover style={popupStyle}>
            <p>
              <button>Hi</button>
            </p>
            <ComboboxList>
              {results.slice(0, 10).map((result) => (
                <ComboboxOption
                  key={result.id}
                  value={`${result.city}, ${result.state}`}
                  selectData={result.id}
                />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        )}
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
  let id = useRef(0);
  return useMemo(
    () =>
      term.trim() === ""
        ? null
        : matchSorter(
            cities.map((city) => {
              if (!city["id"]) {
                city["id"] = id.current;
                id.current = id.current + 1;
              }

              return city;
            }),
            term,
            {
              keys: [(item) => `${item.city}, ${item.state}`],
            }
          ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [throttledTerm]
  );
}

const inputStyle = {
  width: 400,
  fontSize: "100%",
  padding: "0.33rem",
};

const popupStyle = {
  boxShadow: "0px 2px 6px hsla(0, 0%, 0%, 0.15)",
  border: "none",
};
