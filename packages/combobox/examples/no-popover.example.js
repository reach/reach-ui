import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxPopover,
  ComboboxOption,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import { useThrottle } from "use-throttle";
import cities from "./cities";
import "@reach/combobox/styles.css";

let name = "No Popover";

function Example() {
  let [term, setTerm] = React.useState("");
  let results = useCityMatch(term);

  const handleChange = (event) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>No Portal</h2>
      <Combobox style={{ width: "400px" }} aria-label="choose a city">
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
                  fontStyle: "italic",
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

Example.story = { name };
export const Comp = Example;
export default { title: "Combobox" };

////////////////////////////////////////////////////////////////////////////////

function useCityMatch(term) {
  let throttledTerm = useThrottle(term, 100);
  return React.useMemo(
    () =>
      term.trim() === ""
        ? null
        : matchSorter(cities, term, {
            keys: [(item) => `${item.city}, ${item.state}`],
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [throttledTerm]
  );
}
