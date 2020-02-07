import React, { useState } from "react";
import { Listbox, ListboxGroup, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Grouped";

function Example() {
  let [value, setValue] = useState("default");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">{taco} Choose a taco</ListboxOption>
      <hr />
      <ListboxGroup label={<span style={{ color: "crimson" }}>Meat</span>}>
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
      </ListboxGroup>
      <ListboxGroup label="Veggie">
        <ListboxOption value="hibiscus" valueText="Hibiscus">
          {taco} Hibiscus
        </ListboxOption>
        <ListboxOption value="portobello" valueText="Portobello">
          {taco} Portobello
        </ListboxOption>
        <ListboxOption value="fajita" valueText="Fajita">
          {taco} Fajita
        </ListboxOption>
      </ListboxGroup>
    </Listbox>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
