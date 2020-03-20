import React, { useState } from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Controlled";

function Example() {
  let [value, setValue] = useState("default");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        value={value}
        onChange={value => setValue(value)}
      >
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
      </Listbox>
      <hr />
      <button onClick={() => setValue("default")}>Reset</button>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
