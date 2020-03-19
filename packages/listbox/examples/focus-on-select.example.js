import React, { useRef } from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import "@reach/listbox/styles.css";

let name = "Move Focus on Item Select";

function Example() {
  let inputRef = useRef(null);
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        onChange={newValue => {
          inputRef.current.focus();
          action("value changed")(newValue);
          requestAnimationFrame(() => {
            // inputRef.current.focus();
          });
        }}
      >
        <ListboxOption value="asada">
          Carne Asada <Taco />
        </ListboxOption>
        <ListboxOption value="pollo" label="Pollo" disabled>
          Pollo <Taco /> <Tag>Sold Out!</Tag>
        </ListboxOption>
        <div style={{ background: "#ccc" }}>
          <ListboxOption value="pastor" label="Pastor">
            Pastor <Taco /> <Tag>Fan favorite!</Tag>
          </ListboxOption>
        </div>
        <ListboxOption value="lengua">
          Lengua <Taco />
        </ListboxOption>
      </Listbox>
      <hr />
      <div>
        <label>
          <span>Why do you love this taco so much?</span>
          <input ref={inputRef} type="text" />
        </label>
      </div>
    </div>
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
