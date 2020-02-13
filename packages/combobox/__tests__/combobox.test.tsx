import React, { useState, useMemo } from "react";
import { render } from "$test/utils";
import userEvent from "@testing-library/user-event";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import { useThrottle } from "../examples/use-throttle";
import cities from "../examples/cities";

describe("<Combobox />", () => {
  it("should match the snapshot", () => {
    let { asFragment, getByTestId, getByRole } = render(<BasicCombobox />);
    let input = getByTestId("input");
    expect(asFragment()).toMatchSnapshot();
    userEvent.type(input, "e");
    expect(asFragment()).toMatchSnapshot();
    expect(getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });
});

////////////////////////////////////////////////////////////////////////////////
function BasicCombobox() {
  let [term, setTerm] = useState("");
  let results = useCityMatch(term);

  const handleChange = (event: any) => {
    setTerm(event.target.value);
  };

  return (
    <div>
      <h2>Clientside Search</h2>
      <Combobox id="holy-smokes">
        <ComboboxInput
          data-testid="input"
          name="awesome"
          onChange={handleChange}
        />
        {results && (
          <ComboboxPopover portal={false}>
            <p>
              <button>Test focus</button>
            </p>
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

function useCityMatch(term: string) {
  let throttledTerm = useThrottle(term, 100);
  return useMemo(
    () =>
      term.trim() === ""
        ? null
        : matchSorter(cities, term, {
            keys: [item => `${item.city}, ${item.state}`],
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [throttledTerm]
  );
}
