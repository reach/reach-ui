import React, { useState } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Basic";

function Example() {
  let [value, setValue] = useState<React.ReactText>("default");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
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
    </Listbox>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
