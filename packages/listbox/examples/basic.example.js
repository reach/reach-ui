/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

export let name = "Basic";

export let Example = () => (
  <Listbox>
    <ListboxOption value="default">Choose a taco</ListboxOption>
    <hr />
    <ListboxOption value="asada">🌮 Carne Asada</ListboxOption>
    <ListboxOption value="pollo">🌮 Pollo</ListboxOption>
    <ListboxOption value="pastor">🌮 Pastor</ListboxOption>
    <ListboxOption value="lengua">🌮 Lengua</ListboxOption>
  </Listbox>
);
