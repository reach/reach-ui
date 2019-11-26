/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

export let name = "Basic";

export let Example = () => {
  let [value, setValue] = useState("pollo");
  return (
    <Listbox value={value} onChange={value => setValue(value)}>
      <ListboxOption value="default">Choose a taco</ListboxOption>
      <hr />
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
      <hr />
      <div style={{ padding: "0 10px" }}>
        <p>
          I really like tacos. I hope you enjoy them as well!
          <br />
          🌮 🌮 🌮
        </p>
        <button type="button">Useless Button</button>
        <button type="button">Silly Button</button>
      </div>
    </Listbox>
  );
};
