import React, { useState } from "react";
import { render, withMarkup, userEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
  useComboboxContext,
} from "@reach/combobox";
import matchSorter from "match-sorter";
import cities from "../examples/cities";

describe("<Combobox />", () => {
  describe("rendering", () => {
    it("renders as any HTML element", () => {
      jest.useFakeTimers();

      function MyCombobox() {
        let [term, setTerm] = useState("");
        let results = useCityMatch(term);

        return (
          <div>
            <Combobox data-testid="box" as="span">
              <ComboboxInput
                onChange={(event: any) => setTerm(event.target.value)}
                as="textarea"
              />
              {results ? (
                <ComboboxPopover portal={false}>
                  <ComboboxList as="div">
                    {showOpts(results, ({ result, index }) => (
                      <ComboboxOption
                        as="div"
                        key={index}
                        value={result.city}
                      />
                    ))}
                  </ComboboxList>
                </ComboboxPopover>
              ) : null}
            </Combobox>
          </div>
        );
      }

      let { getByTestId, getByRole, getAllByRole } = render(<MyCombobox />);
      expect(getByTestId("box").tagName).toBe("SPAN");
      expect(getByRole("combobox").tagName).toBe("TEXTAREA");

      // Type to show the list
      userEvent.type(getByRole("combobox"), "e");
      jest.advanceTimersByTime(100);

      expect(getByRole("listbox").tagName).toBe("DIV");
      expect(getAllByRole("option")[0].tagName).toBe("DIV");
    });

    it("renders when using the useComboboxContext hook", () => {
      function CustomComboboxInput(props: any) {
        const { isExpanded } = useComboboxContext();
        return (
          <ComboboxInput
            {...props}
            style={{ backgroundColor: isExpanded ? "cornsilk" : "aliceblue" }}
          />
        );
      }

      function MyCombobox() {
        let [term, setTerm] = useState("");
        let results =
          term.trim() === ""
            ? null
            : matchSorter(["Apple", "Banana", "Orange"], term);
        return (
          <Combobox>
            <CustomComboboxInput
              aria-labelledby="choose-a-fruit"
              onChange={(event: any) => setTerm(event.target.value)}
            />
            {results && results.length && (
              <ComboboxPopover>
                <ComboboxList>
                  {results.map((result, index) => (
                    <ComboboxOption key={index} value={result} />
                  ))}
                </ComboboxList>
              </ComboboxPopover>
            )}
          </Combobox>
        );
      }

      let { getByRole, getAllByRole } = render(<MyCombobox />);

      userEvent.type(getByRole("combobox"), "a");
      jest.advanceTimersByTime(100);

      expect(getByRole("listbox")).toBeTruthy();
      expect(getAllByRole("option")[0]).toBeTruthy();
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      jest.useRealTimers();
      let { container } = render(<BasicCombobox />);
      let results: AxeResults = null as any;
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should forward aria-label from Combobox to ComboboxInput", () => {
      let { getByRole } = render(<ComboboxExample />);
      let input = getByRole("combobox");

      expect(input).toHaveAttribute("aria-label");
      expect(input.getAttribute("aria-label")).toBe("choose a fruit");

      function ComboboxExample() {
        return (
          <Combobox aria-label="choose a fruit">
            <ComboboxInput />
            <ComboboxPopover>
              <ComboboxList>
                <ComboboxOption value="Apple" />
                <ComboboxOption value="Banana" />
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
        );
      }
    });

    it("should forward aria-labelledby from Combobox to ComboboxInput", () => {
      let { getByRole } = render(<ComboboxExample />);
      let input = getByRole("combobox");

      expect(input).toHaveAttribute("aria-labelledby");
      expect(input.getAttribute("aria-labelledby")).toBe("choose-a-fruit");

      function ComboboxExample() {
        return (
          <div>
            <h1 id="choose-a-fruit">Choose a Fruit</h1>
            <Combobox aria-labelledby="choose-a-fruit">
              <ComboboxInput />
              <ComboboxPopover>
                <ComboboxList>
                  <ComboboxOption value="Apple" />
                  <ComboboxOption value="Banana" />
                </ComboboxList>
              </ComboboxPopover>
            </Combobox>
          </div>
        );
      }
    });

    it("aria-label set on ComboboxInput should take precedence", () => {
      let { getByRole } = render(<ComboboxExample />);
      let input = getByRole("combobox");

      expect(input).toHaveAttribute("aria-label");
      expect(input.getAttribute("aria-label")).toBe("label set on input");

      function ComboboxExample() {
        return (
          <Combobox aria-label="label set on combobox">
            <ComboboxInput aria-label="label set on input" />
            <ComboboxPopover>
              <ComboboxList>
                <ComboboxOption value="Apple" />
                <ComboboxOption value="Banana" />
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
        );
      }
    });

    it("aria-labelledby set on ComboboxInput should take precedence", () => {
      let { getByRole } = render(<ComboboxExample />);
      let input = getByRole("combobox");

      expect(input).toHaveAttribute("aria-labelledby");
      expect(input.getAttribute("aria-labelledby")).toBe("used-for-label");

      function ComboboxExample() {
        return (
          <div>
            <p id="not-used-for-label">choose a fruit</p>
            <p id="used-for-label">choose a fruit</p>
            <Combobox aria-labelledby="not-used-for-label">
              <ComboboxInput aria-labelledby="used-for-label" />
              <ComboboxPopover>
                <ComboboxList>
                  <ComboboxOption value="Apple" />
                  <ComboboxOption value="Banana" />
                </ComboboxList>
              </ComboboxPopover>
            </Combobox>
          </div>
        );
      }
    });
  });

  describe("user events", () => {
    it("should open a list on text entry", () => {
      jest.useFakeTimers();
      let optionToSelect = "Eagle Pass, Texas";
      let { getByRole, getByText } = render(<BasicCombobox />);
      let getByTextWithMarkup = withMarkup(getByText);
      let input = getByRole("combobox");

      userEvent.type(input, "e");
      jest.advanceTimersByTime(100);

      expect(getByRole("listbox")).toBeInTheDocument();
      expect(getByTextWithMarkup(optionToSelect)).toBeInTheDocument();
    });

    // it("should persistSelection when a value is set", () => {
    //   jest.useFakeTimers();
    //   let { getByRole } = render(<MyCombobox />);

    //   function MyCombobox() {
    //     let [term, setTerm] = useState("");
    //     let results =
    //       term.trim() === ""
    //         ? null
    //         : matchSorter(["Apple", "Banana", "Orange"], term);
    //     return (
    //       <Combobox>
    //         <ComboboxInput
    //           aria-labelledby="choose-a-fruit"
    //           onChange={(event: any) => setTerm(event.target.value)}
    //         />
    //         {results && results.length && (
    //           <ComboboxPopover>
    //             <ComboboxList>
    //               {results.map((result, index) => (
    //                 <ComboboxOption key={index} value={result} />
    //               ))}
    //             </ComboboxList>
    //           </ComboboxPopover>
    //         )}
    //       </Combobox>
    //     );
    //   }

    //   let input = getByRole("combobox");

    //   // TODO: This test fails. No idea why. This sequence works fine IRL.
    //   // Someone fix it for me plz.
    //   userEvent.type(input, "A");
    //   jest.advanceTimersByTime(100);
    //   fireEvent.keyDown(input, { key: "ArrowDown", code: 40 });
    //   fireEvent.keyDown(input, { key: "Enter", code: 13 });
    //   jest.advanceTimersByTime(100);
    //   expect(input).toHaveValue("Apple");
    //   expect(true).toBeTruthy();
    // });
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
          name="awesome"
          onChange={handleChange}
        />
        {results ? (
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
        keys: [(item) => `${item.city}, ${item.state}`],
      });
}

function showOpts<R>(
  results: R[],
  render: (props: { result: R; index: number }) => React.ReactNode
) {
  return results.slice(0, 10).map((result, index) => render({ result, index }));
}
