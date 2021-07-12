import * as React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { Listbox, ListboxGroup, ListboxOption } from "@reach/listbox";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "Grouped";

function Example() {
  let [value, setValue] = React.useState("default");
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        value={value}
        onChange={(value) => setValue(value)}
      >
        <ListboxOption value="default" label="Choose a taco">
          <Taco /> Choose a taco
        </ListboxOption>
        <hr />
        <ListboxGroup label={<span style={{ color: "crimson" }}>Meat</span>}>
          <ListboxOption value="asada" label="Carne Asada">
            <Taco /> Carne Asada
          </ListboxOption>
          <ListboxOption value="pollo" label="Pollo">
            <Taco /> Pollo
          </ListboxOption>
          <ListboxOption value="pastor" label="Pastor">
            <Taco /> Pastor
          </ListboxOption>
          <ListboxOption value="lengua" label="Lengua">
            <Taco /> Lengua
          </ListboxOption>
        </ListboxGroup>
        <ListboxGroup label="Veggie">
          <ListboxOption value="hibiscus" label="Hibiscus">
            <Taco /> Hibiscus
          </ListboxOption>
          <ListboxOption value="portobello" label="Portobello">
            <Taco /> Portobello
          </ListboxOption>
          <ListboxOption value="fajita" label="Fajita">
            <Taco /> Fajita
          </ListboxOption>
        </ListboxGroup>
      </Listbox>
    </div>
  );
}

Example.storyName = name;
export { Example };
