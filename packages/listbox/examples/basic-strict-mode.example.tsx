import React, { StrictMode } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import "@reach/listbox/styles.css";

let name = "Basic (Strict Mode)";

type Option = { value: string; label: string };

function Example() {
  return (
    <StrictMode>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        defaultValue="asada"
        onChange={action("value changed")}
      >
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
        <div style={{ background: "#ccc" }}>
          <ListboxOption value="pastor">
            Pastor <Taco /> <Tag>Fan favorite!</Tag>
          </ListboxOption>
        </div>
        <ListboxOption value="lengua">
          Lengua <Taco />
        </ListboxOption>
      </Listbox>
    </StrictMode>
  );
}

function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}

function Tag(props: any) {
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
