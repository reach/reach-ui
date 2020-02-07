import React, { useState } from "react";
import {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxOption,
} from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Grouped with Composed Label";

function GroupLabel({ icon, children, ...props }) {
  return (
    <ListboxGroupLabel {...props}>
      <span aria-hidden>{icon}</span> {children}
    </ListboxGroupLabel>
  );
}

function Example() {
  let [value, setValue] = useState("default");
  let taco = <span aria-hidden>🌮</span>;
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">{taco} Choose a taco</ListboxOption>
      <hr />
      <ListboxGroup>
        <GroupLabel icon="🍖">Meat</GroupLabel>
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
      <ListboxGroup>
        <GroupLabel icon="🥕">Veggie</GroupLabel>
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
