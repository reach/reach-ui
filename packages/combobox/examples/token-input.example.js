import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

let name = "Token Input";

const Context = React.createContext();

function Example() {
  let [term, setTerm] = React.useState("");
  let [selections, setSelections] = React.useState([]);
  let results = useCityMatch(term);

  const handleChange = (event) => {
    setTerm(event.target.value);
  };

  const handleSelect = (value) => {
    setSelections(selections.concat([value]));
    setTerm("");
  };

  return (
    <div>
      <h2>Tokenbox</h2>
      <ExampleTokenbox onSelect={handleSelect}>
        <ExampleTokenLabel
          onRemove={(item) => {
            setSelections(selections.filter((s) => s !== item));
          }}
          style={{
            border: "1px solid #888",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {selections.map((selection) => (
            <ExampleToken value={selection} />
          ))}
          <ExampleTokenInput
            value={term}
            onChange={handleChange}
            autocomplete={false}
            style={{
              outline: "none",
              border: "none",
              flexGrow: 1,
              margin: "0.25rem",
              font: "inherit",
            }}
          />
        </ExampleTokenLabel>
        {results && (
          <ComboboxPopover>
            {results.length === 0 && (
              <p>
                No Results{" "}
                <button
                  onClick={() => {
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
      </ExampleTokenbox>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Combobox" };

////////////////////////////////////////////////////////////////////////////////

function ExampleTokenLabel({ onRemove, onKeyDown, ...props }) {
  const selectionsRef = React.useRef([]);
  const [selectionNavIndex, setSelectionNavIndex] = React.useState(-1);

  React.useLayoutEffect(() => {
    selectionsRef.current = [];
    return () => (selectionsRef.current = []);
  });

  const handleKeyDown = (event) => {
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
    selectionNavIndex,
  };

  return (
    <Context.Provider value={context}>
      <label
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        {...props}
      />
    </Context.Provider>
  );
}

function ExampleToken({ value, ...props }) {
  const { selectionsRef } = React.useContext(Context);
  // NEXT: need to know my index so that I can be highlighted on ArrowLeft!

  React.useEffect(() => {
    selectionsRef.current.push(value);
  });

  return (
    <span style={selectionStyle} {...props}>
      {value}
    </span>
  );
}

function ExampleTokenbox({ onSelect, ...props }) {
  const handleSelect = () => {};
  return (
    <Combobox
      onSelect={composeEventHandlers(onSelect, handleSelect)}
      aria-label="choose a city"
      {...props}
    />
  );
}

function ExampleTokenInput({ onKeyDown, ...props }) {
  const { onRemove, selectionsRef } = React.useContext(Context);
  const handleKeyDown = (event) => {
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
    <ComboboxInput
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      {...props}
    />
  );
}

const selectionStyle = {
  fontSize: "11px",
  background: "#eee",
  border: "solid 1px #aaa",
  margin: "0.25rem",
  borderRadius: "1000px",
  padding: "0.2rem 0.5rem",
  userSelect: "none",
};
