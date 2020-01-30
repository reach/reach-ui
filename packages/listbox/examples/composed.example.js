/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover
} from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Composed";

function Example() {
  let [value, setValue] = useState("pollo");
  return (
    <ListboxInput value={value} onChange={value => setValue(value)}>
      <ListboxButton arrow="▼" />
      <ListboxPopover>
        <ListboxList>
          <ListboxOption value="default">🌮 Choose a taco</ListboxOption>
          <hr />
          <ListboxOption value="asada" valueText="Carne Asada">
            🌮 Carne Asada
          </ListboxOption>
          <ListboxOption value="pollo" valueText="Pollo">
            🌮 Pollo
          </ListboxOption>
          <ListboxOption value="pastor" valueText="Pastor">
            🌮 Pastor
          </ListboxOption>
          <ListboxOption value="lengua" valueText="Lengua">
            🌮 Lengua
          </ListboxOption>
        </ListboxList>
        <hr />
        <div style={{ padding: "0 10px" }}>
          <p>
            I really like tacos. I hope you enjoy them as well!
            <br />
            🌮 🌮 🌮
          </p>
          <button type="button">Useless Button</button>
          <button type="button">Silly Button</button>
        </div>
      </ListboxPopover>
    </ListboxInput>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
