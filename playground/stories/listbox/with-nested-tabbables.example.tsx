import * as React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { Listbox, ListboxOption } from "@reach/listbox";
import { action } from "@storybook/addon-actions";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "With nested tabbables";

type Option = { value: string; label: string };

function Example() {
  let [value, setValue] = React.useState("default");
  let [newOption, setNewOption] = React.useState("");
  let [newOptions, setNewOptions] = React.useState<Option[]>([]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!newOption.trim()) {
      return;
    }
    setNewOptions([
      ...newOptions,
      {
        value: newOption.toLowerCase().replace(" ", ""),
        label: formatOption(newOption),
      },
    ]);
    setNewOption("");
  }

  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        value={value}
        onChange={(value) => {
          setValue(value);
          action("Value Change")(value);
        }}
      >
        <ListboxOption value="default" label="Choose a taco">
          <Taco /> Choose a taco
        </ListboxOption>
        <hr />

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 10 }}>
            <label>
              <span>Add another option</span>
              <input
                type="text"
                value={newOption}
                onChange={(event) => setNewOption(event.target.value)}
              />
            </label>
            <button type="submit">Add it!</button>
          </div>
        </form>
        <hr />
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
        {newOptions.map((option) => (
          <ListboxOption
            key={option.value}
            value={option.value}
            label={option.label}
          >
            <Taco /> {option.label}
          </ListboxOption>
        ))}
      </Listbox>
    </div>
  );
}

function formatOption(string: string) {
  return string
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

Example.storyName = name;
export { Example };
