import React, { useState } from "react";
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
  let [value, setValue] = useState<React.ReactText>("pollo");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <ListboxInput value={value} onChange={value => setValue(value)}>
      <ListboxButton arrow="▼" />
      <ListboxPopover>
        <ListboxList>
          <ListboxOption value="default">{taco} Choose a taco</ListboxOption>
          <hr />
          <ListboxOption value="asada" valueText="Carne Asada">
            {taco} Carne Asada
          </ListboxOption>
          <ListboxOption value="pollo" valueText="Pollo">
            {taco} Pollo
          </ListboxOption>
          <ListboxOption value="pastor" valueText="Pastor">
            {taco} Pastor
          </ListboxOption>
          <ListboxOption value="lengua" valueText="Lengua">
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
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
