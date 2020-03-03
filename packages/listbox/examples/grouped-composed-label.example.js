import React, { useState } from "react";
import VisuallyHidden from "@reach/visually-hidden";
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
        <ListboxGroup>
          <GroupLabel icon="🍖">Meat</GroupLabel>
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
        </ListboxGroup>
        <ListboxGroup>
          <GroupLabel icon="🥕">Veggie</GroupLabel>
          <ListboxOption value="hibiscus" label="Hibiscus">
            {taco} Hibiscus
          </ListboxOption>
          <ListboxOption value="portobello" label="Portobello">
            {taco} Portobello
          </ListboxOption>
          <ListboxOption value="fajita" label="Fajita">
            {taco} Fajita
          </ListboxOption>
        </ListboxGroup>
      </Listbox>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
