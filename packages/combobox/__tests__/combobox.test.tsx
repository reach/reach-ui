import React, { useState } from "react";
import { render, act, withMarkup } from "$test/utils";
// import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
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
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // TODO: Fails: ARIA attributes must conform to valid values (aria-valid-attr-value)
  // it("should not have basic a11y issues", async () => {
  //   const { container } = render(<BasicCombobox />);
  //   const results = await axe(container);
  //   expect(results).toHaveNoViolations();
  // });

  it("should match the snapshot", () => {
    let { baseElement, getByTestId, getByRole } = render(<BasicCombobox />);
    let input = getByTestId("input");
    expect(baseElement).toMatchSnapshot("before text input");
    userEvent.type(input, "e");
    expect(baseElement).toMatchSnapshot("after text input");
    expect(getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });

  it("should open a list on text entry", () => {
    let optionToSelect = "Eagle Pass, Texas";

    let { getByTestId, getByText } = render(<BasicCombobox />);
    let getByTextWithMarkup = withMarkup(getByText);
    let input = getByTestId("input");
    userEvent.type(input, "e");
    act(() => void jest.advanceTimersByTime(100));
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
