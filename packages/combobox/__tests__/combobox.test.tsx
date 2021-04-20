import * as React from "react";
import { render, act, withMarkup, userEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
  ComboboxInputProps,
  useComboboxContext,
} from "@reach/combobox";
import { matchSorter } from "match-sorter";
import cities from "../examples/cities";

describe("<Combobox />", () => {
  describe("rendering", () => {
    it("renders as any HTML element", async () => {
      function MyCombobox() {
        let [term, setTerm] = React.useState("");
        let results = useCityMatch(term);

        return (
          <div>
            <Combobox data-testid="box" as="span">
              <ComboboxInput
                data-testid="input"
                as="textarea"
                onChange={(event: any) => setTerm(event.target.value)}
              />
              {results ? (
                <ComboboxPopover portal={false}>
                  <ComboboxList data-testid="list" as="div">
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

      let { getByTestId, getAllByRole } = render(<MyCombobox />);
      expect(getByTestId("box").tagName).toBe("SPAN");
      expect(getByTestId("input").tagName).toBe("TEXTAREA");

      // Type to show the list
      await userEvent.type(getByTestId("input"), "e");

      expect(getByTestId("list").tagName).toBe("DIV");
      expect(getAllByRole("option")[0].tagName).toBe("DIV");
    });

    it("renders when using the useComboboxContext hook", async () => {
      function CustomComboboxInput(props: ComboboxInputProps) {
        const { isExpanded } = useComboboxContext();
        return (
          <ComboboxInput
            {...props}
            style={{ backgroundColor: isExpanded ? "cornsilk" : "aliceblue" }}
          />
        );
      }

      function MyCombobox() {
        return (
          <Combobox data-testid="box">
            <CustomComboboxInput
              data-testid="input"
              aria-labelledby="choose-a-fruit"
            />
            <ComboboxPopover>
              <ComboboxList data-testid="list">
                <ComboboxOption value="Apple" />
                <ComboboxOption value="Banana" />
                <ComboboxOption value="Orange" />
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
        );
      }

      let { getByTestId, getAllByRole } = render(<MyCombobox />);

      // Type to show the list

      await userEvent.type(getByTestId("input"), "a");
      //jest.advanceTimersByTime(100);

      expect(getByTestId("list")).toBeTruthy();
      expect(getAllByRole("option")[0]).toBeTruthy();
    });
  });

  describe("a11y", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      let { container } = render(<BasicCombobox />);
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
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
    it("should open a list on text entry", async () => {
      let optionToSelect = "Eagle Pass, Texas";
      let { getByTestId, getByText } = render(<BasicCombobox />);
      let getByTextWithMarkup = withMarkup(getByText);
      let input = getByTestId("input");

      await userEvent.type(input, "e");

      expect(getByTestId("list")).toBeInTheDocument();
      expect(getByTextWithMarkup(optionToSelect)).toBeInTheDocument();
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
function BasicCombobox() {
  let [term, setTerm] = React.useState("");
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
        keys: [(item) => `${item.city}, ${item.state}`],
      });
}

function showOpts<R>(
  results: R[],
  render: (props: { result: R; index: number }) => React.ReactNode
) {
  return results.slice(0, 10).map((result, index) => render({ result, index }));
}
