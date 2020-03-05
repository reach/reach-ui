import React, { useState } from "react";
import VisuallyHidden from "@reach/visually-hidden";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover,
} from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Composed";

function Example() {
  let [value, setValue] = useState("pollo");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <ListboxInput
        aria-labelledby="taco-label"
        value={value}
        onChange={value => setValue(value)}
      >
        <ListboxButton arrow="▼" />
        <ListboxPopover>
          <ListboxList>
            <ListboxOption value="default" label="Choose a taco">
              {taco} Choose a taco
            </ListboxOption>
            <hr />
            <ListboxOption value="asada" label="Carne Asada">
              {taco} Carne Asada
            </ListboxOption>
            <ListboxOption value="pollo" label="Pollo">
              {taco} Pollo
            </ListboxOption>
            <ListboxOption value="pastor" label="Pastor">
              {taco} Pastor
            </ListboxOption>
            <ListboxOption value="lengua" label="Lengua">
              {taco} Lengua
            </ListboxOption>
          </ListboxList>
          <hr />
          <div style={{ padding: "0 10px" }}>
            <p>
              I really like tacos. I hope you enjoy them as well!
              <br />
              {taco} {taco} {taco}
            </p>
            <button type="button">Useless Button</button>
            <button type="button">Silly Button</button>
          </div>
        </ListboxPopover>
      </ListboxInput>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
