import React, { useState } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Controlled";

function Example() {
  let [value, setValue] = useState("default");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">{taco} Choose a taco</ListboxOption>
      <hr />
      <button>Yo, what am I here for?</button>
      <input type="text" />
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
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
