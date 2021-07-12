import * as React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import { Listbox, ListboxOption } from "@reach/listbox";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "Controlled";

function Example() {
  let [value, setValue] = React.useState("default");
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        value={value}
        onChange={(value) => {
          setValue(value);
          action("Value changed")(value);
        }}
      >
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
      </Listbox>
      <hr />
      <button onClick={() => setValue("default")}>Reset</button>
    </div>
  );
}

Example.storyName = name;
export { Example };
