import "../styles.css";
import React, {
  useContext,
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  createContext
} from "react";
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
import { wrapEvent } from "@reach/utils";

export let name = "Controlled";

const Context = createContext();

function TokenLabel({ onRemove, onKeyDown, ...props }) {
  const selectionsRef = useRef([]);
  const [selectionNavIndex, setSelectionNavIndex] = useState(-1);

  useLayoutEffect(() => {
    selectionsRef.current = [];
    return () => (selectionsRef.current = []);
  });

  const handleKeyDown = event => {
    if (event.key === "ArrowLeft") {
      if (selectionNavIndex > 0) {
        setSelectionNavIndex(selectionNavIndex - 1);
      } else if (selectionsRef.current.length > 0) {
        setSelectionNavIndex(selectionsRef.current.length - 1);
      }
    }
  };

  const context = {
    onRemove,
    selectionsRef,
    selectionNavIndex
  };

  return (
    <Context.Provider value={context}>
      <label onKeyDown={wrapEvent(onKeyDown, handleKeyDown)} {...props} />
    </Context.Provider>
  );
}

function Token({ value, ...props }) {
  const { selectionsRef } = useContext(Context);
  // NEXT: need to know my index so that I can be highlighted on ArrowLeft!

  useEffect(() => {
    selectionsRef.current.push(value);
  });

  return (
    <span style={selectionStyle} {...props}>
      {value}
    </span>
  );
}

function Tokenbox({ onSelect, ...props }) {
  const handleSelect = () => {};
  return <Combobox onSelect={wrapEvent(onSelect, handleSelect)} {...props} />;
}

function TokenInput({ onKeyDown, ...props }) {
  const { onRemove, selectionsRef } = useContext(Context);
  const handleKeyDown = event => {
    const { value } = event.target;
    if (
      event.key === "Backspace" &&
      value === "" &&
      selectionsRef.current.length > 0
    ) {
      onRemove(selectionsRef.current[selectionsRef.current.length - 1]);
    }
  };
  return (
    <ComboboxInput onKeyDown={wrapEvent(onKeyDown, handleKeyDown)} {...props} />
  );
}

export function Example() {
  let [term, setTerm] = useState("");
  let [selections, setSelections] = useState([]);
  let results = useCityMatch(term);

  const handleChange = event => {
    setTerm(event.target.value);
  };

  const handleSelect = value => {
    setSelections(selections.concat([value]));
    setTerm("");
  };

  return (
    <div>
      <h2>Tokenbox</h2>
      <Tokenbox onSelect={handleSelect}>
        <TokenLabel
          onRemove={item => {
            setSelections(selections.filter(s => s !== item));
          }}
          style={{
            border: "1px solid #888",
            display: "flex",
            flexWrap: "wrap"
          }}
        >
          {selections.map(selection => (
            <Token value={selection} />
          ))}
          <TokenInput
            value={term}
            onChange={handleChange}
            autocomplete={false}
            style={{
              outline: "none",
              border: "none",
              flexGrow: 1,
              margin: "0.25rem",
              font: "inherit"
            }}
          />
        </TokenLabel>
        {results && (
          <ComboboxPopover>
            {results.length === 0 && (
              <p>
                No Results{" "}
                <button
                  onClick={() => {
                    console.log("YOOOOOO");
                    setTerm("");
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
          </ComboboxPopover>
        )}
      </Tokenbox>
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

const selectionStyle = {
  fontSize: "11px",
  background: "#eee",
  border: "solid 1px #aaa",
  margin: "0.25rem",
  borderRadius: "1000px",
  padding: "0.2rem 0.5rem"
};
