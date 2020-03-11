import React, { useState } from "react";
import { render, act, withMarkup, userEvent } from "$test/utils";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import cities from "../examples/cities";

describe("<Combobox />", () => {
  it("should not have basic a11y issues", async () => {
    let { container } = render(<BasicCombobox />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should open a list on text entry", () => {
    jest.useFakeTimers();
    let optionToSelect = "Eagle Pass, Texas";
    let { getByTestId, getByText } = render(<BasicCombobox />);
    let getByTextWithMarkup = withMarkup(getByText);
    let input = getByTestId("input");
    act(() => {
      userEvent.type(input, "e");
      jest.advanceTimersByTime(100);
    });
    expect(getByTestId("list")).toBeInTheDocument();
    expect(getByTextWithMarkup(optionToSelect)).toBeInTheDocument();
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
          aria-label="cool search"
          data-testid="input"
          name="awesome"
          onChange={handleChange}
        />
        {results ? (
          <ComboboxPopover portal={false}>
            <p>
              <button>Test focus</button>
            </p>
            <ComboboxList data-testid="list">
              {results.slice(0, 10).map((result, index) => (
                <ComboboxOption
                  key={index}
                  value={`${result.city}, ${result.state}`}
                />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        ) : (
          <span>No Results!</span>
        )}
      </Combobox>
    </div>
  );
}

function useCityMatch(term: string) {
  return term.trim() === ""
    ? null
    : matchSorter(cities, term, {
        keys: [item => `${item.city}, ${item.state}`],
      });
}
