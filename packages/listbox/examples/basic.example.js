import React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import { action } from "@storybook/addon-actions";
import "@reach/listbox/styles.css";

let name = "Basic";

function Example() {
  return (
    <Listbox onChange={action("value changed")}>
      <ListboxOption value="default">
        Choose a taco <Taco />
      </ListboxOption>
      <hr />
      <ListboxOption value="asada">
        Carne Asada <Taco />
      </ListboxOption>
      <ListboxOption value="pollo" disabled>
        Pollo <Taco /> <Tag>Sold Out!</Tag>
      </ListboxOption>
      <ListboxOption value="pastor">
        Pastor <Taco />
      </ListboxOption>
      <ListboxOption value="lengua">
        Lengua <Taco />
      </ListboxOption>
    </Listbox>
  );
}

function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}

function Tag(props) {
  return (
    <span
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bolder",
        marginLeft: 6,
        padding: 4,
        background: "crimson",
        borderRadius: 2,
        color: "#fff",
      }}
      {...props}
    />
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Listbox" };
