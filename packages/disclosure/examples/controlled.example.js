import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosurePanel
} from "@reach/disclosure";

let name = "Controlled";

function Example() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (value.toLowerCase().trim() === "open") {
      setOpen(true);
    } else if (value.toLowerCase().trim() === "close") {
      setOpen(false);
    }
  }, [value]);

  return (
    <div>
      <label style={{ display: "block" }}>
        <span>Type "{open ? "close" : "open"}"</span>
        <input
          style={{ display: "block", margin: "10px 0" }}
          type="text"
          value={value}
          onChange={event => setValue(event.target.value)}
        />
      </label>
      <Disclosure open={open} onChange={() => setOpen(!open)}>
        <DisclosureTrigger>I have a secret</DisclosureTrigger>
        <DisclosurePanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Disclosure" };
