/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxOption
} from "@reach/listbox";
import "@reach/listbox/styles.css";

export let name = "Grouped with Composed Label";

function GroupLabel({ icon, children, ...props }) {
  return (
    <ListboxGroupLabel {...props}>
      <span>{icon}</span> {children}
    </ListboxGroupLabel>
  );
}

export let Example = () => {
  let [value, setValue] = useState("default");
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">🌮 Choose a taco</ListboxOption>
      <hr />
      <ListboxGroup>
        <GroupLabel icon="🍖">Meat</GroupLabel>
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
      <ListboxGroup>
        <GroupLabel icon="🥕">Veggie</GroupLabel>
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
};
