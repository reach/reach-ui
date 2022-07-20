import * as React from "react";
import { cleanup, render, act } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { matchSorter } from "match-sorter";
import cities from "./cities";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Combobox /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    vi.useRealTimers();
    let { container } = render(<BasicCombobox />);
    let results: AxeCore.AxeResults = null as any;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();
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
