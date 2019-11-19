import React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

export let name = "Basic";

export let Example = () => (
  <Listbox defaultValue="download">
    <ListboxOption value="default" disabled>
      Select an Option
    </ListboxOption>
    <ListboxOption value="download">Download</ListboxOption>
    <ListboxOption value="create">Create a Copy</ListboxOption>
    <ListboxOption value="draft">Mark as Draft</ListboxOption>
    <ListboxOption value="delete">Delete</ListboxOption>
  </Listbox>
);
