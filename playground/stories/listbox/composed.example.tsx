import * as React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover,
} from "@reach/listbox";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "Composed";

function Example() {
  let [value, setValue] = React.useState("pollo");
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <ListboxInput
        aria-labelledby="taco-label"
        value={value}
        onChange={(value) => setValue(value)}
      >
        <ListboxButton arrow="▼" />
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
              <Taco />
              <Taco />
              <Taco />
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
