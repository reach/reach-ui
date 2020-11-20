import * as React from "react";
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

let name = "Lots of Elements";

function Example() {
  let [term, setTerm] = React.useState("");
  let results = useCityMatch(term);

  const handleChange = (event) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>

      <Combobox aria-label="choose a city">
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
