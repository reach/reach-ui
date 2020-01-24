import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@reach/disclosure";

let name = "Basic (TS)";

function Example() {
  return (
    <Disclosure>
      <DisclosureButton>I have a secret</DisclosureButton>
      <DisclosurePanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </DisclosurePanel>
    </Disclosure>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Disclosure" };
