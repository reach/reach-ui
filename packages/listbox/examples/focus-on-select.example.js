import * as React from "react";
import { Listbox, ListboxOption } from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import { Tag, Taco } from "./common";
import "@reach/listbox/styles.css";

let name = "Move Focus on Item Select";

// NOTE: This is NOT a good pattern. It is rarely a good idea to move focus
// unless the event triggered by the user's action explicitly dictates that
// focus should be moved. This example is for testing that focus indeed moves
// in onChange as expected, since we're managing focus internally.

function Example() {
  let inputRef = React.useRef(null);
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        onChange={(newValue) => {
          inputRef.current.focus();
          action("value changed")(newValue);
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

Example.storyName = name;
export { Example };
