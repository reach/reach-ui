import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { useCityMatch } from "./utils";
import "@reach/combobox/styles.css";

let name = "Basic";

function showOpts<R>(
  results: R[],
  render: (props: { result: R; index: number }) => React.ReactNode
) {
  return results.slice(0, 10).map((result, index) => render({ result, index }));
}

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
            <ComboboxList data-testid="list" as="ul">
              {showOpts(results, ({ result, index }) => (
                <ComboboxOption as="li" key={index} value={result.city} />
              ))}
            </ComboboxList>
          </ComboboxPopover>
        ) : null}
      </Combobox>
    </div>
  );
}

function Example() {
  return <MyCombobox />;
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const inputStyle = {
  width: 400,
  fontSize: "100%",
  padding: "0.33rem",
};

const popupStyle = {
  boxShadow: "0px 2px 6px hsla(0, 0%, 0%, 0.15)",
  border: "none",
};
