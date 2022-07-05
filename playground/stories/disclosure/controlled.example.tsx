import * as React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

let name = "Controlled";

function Example() {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
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
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <Disclosure open={open} onChange={() => setOpen(!open)}>
        <DisclosureButton>I have a secret</DisclosureButton>
        <DisclosurePanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}

Example.storyName = name;
export { Example };
