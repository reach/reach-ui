/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Listbox, ListboxGroup, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Grouped";

function Example() {
  let [value, setValue] = useState("default");
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">🌮 Choose a taco</ListboxOption>
      <hr />
      <ListboxGroup label={<span style={{ color: "crimson" }}>Meat</span>}>
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
      </ListboxGroup>
      <ListboxGroup label="Veggie">
        <ListboxOption value="hibiscus" valueText="Hibiscus">
          🌮 Hibiscus
        </ListboxOption>
        <ListboxOption value="portobello" valueText="Portobello">
          🌮 Portobello
        </ListboxOption>
        <ListboxOption value="fajita" valueText="Fajita">
          🌮 Fajita
        </ListboxOption>
      </ListboxGroup>
    </Listbox>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
