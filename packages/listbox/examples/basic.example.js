import React from "react";
import {
  Listbox,
  ListboxPopover,
  ListboxOption,
  ListboxButton
} from "@reach/listbox";
import "@reach/listbox/styles.css";

export let name = "Basic";

export let Example = () => (
  <Listbox>
    <ListboxButton id="example-button">
      Select an option <span aria-hidden="true">▾</span>
    </ListboxButton>
    <ListboxPopover>
      <ListboxOption>Download</ListboxOption>
      <ListboxOption>Create a Copy</ListboxOption>
      <ListboxOption>Mark as Draft</ListboxOption>
      <ListboxOption>Delete</ListboxOption>
    </ListboxPopover>
  </Listbox>
);
