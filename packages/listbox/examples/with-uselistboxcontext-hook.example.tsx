import * as React from "react";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover,
  ListboxButtonProps,
  useListboxContext,
} from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "With useListboxContext (TS)";

function StyledListboxButton(props: ListboxButtonProps) {
  const { isExpanded } = useListboxContext();

  return (
    <ListboxButton
      style={{
        border: "2px solid",
        borderColor: isExpanded ? "crimson" : "black",
      }}
      {...props}
    />
  );
}

function Example() {
  let [value, setValue] = React.useState("pollo");

  function handleChange(value: any) {
    setValue(value);
    return action("value changed")(value);
  }

  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <ListboxInput
        aria-labelledby="taco-label"
        value={value}
        onChange={handleChange}
      >
        <StyledListboxButton arrow="▼" />
        <ListboxPopover>
          <ListboxList>
            <ListboxOption value="default" label="Choose a taco">
              <Taco /> Choose a taco
            </ListboxOption>
            <hr />
            <ListboxOption value="asada" label="Carne Asada">
              <Taco /> Carne Asada
            </ListboxOption>
            <ListboxOption value="pollo" label="Pollo">
              <Taco /> Pollo
            </ListboxOption>
            <ListboxOption value="pastor" label="Pastor">
              <Taco /> Pastor
            </ListboxOption>
            <ListboxOption value="lengua" label="Lengua">
              <Taco /> Lengua
            </ListboxOption>
          </ListboxList>
          <hr />
          <div style={{ padding: "0 10px" }}>
            <p>
              I really like tacos. I hope you enjoy them as well!
              <br />
              <Taco /> <Taco /> <Taco />
            </p>
            <button type="button">Useless Button</button>
            <button type="button">Silly Button</button>
          </div>
        </ListboxPopover>
      </ListboxInput>
    </div>
  );
}

Example.storyName = name;
export { Example };
